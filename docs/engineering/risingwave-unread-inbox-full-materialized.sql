-- RisingWave full materialization draft for sidebar unread summary and Inbox.
--
-- This file is intentionally documentation / deployment input only. It is not
-- run by the Postgres migration runner. Create these objects in RisingWave only
-- after review and a production deployment plan.
--
-- The authoritative Postgres serving behavior remains the legacy inline SQL in
-- packages/server/src/services/channelService.ts. The already-applied
-- pg_* views in packages/server/drizzle/0084_risingwave_pg_views.sql are
-- kept as reference contracts only; production no-env traffic does not query
-- those views. Keep this RW DDL, the inline PG SQL, and the pg_* reference
-- views aligned when changing inbox/unread semantics.
--
-- Server code uses these objects only when RISINGWAVE_DATABASE_URL is set.
-- Without that env var, the server uses the legacy inline Postgres SQL path.
-- The inbox MV is intentionally a wide serving contract rather than a narrow
-- activity MV: benchmark probes showed the narrow MV made light users pay
-- multi-join serving overhead, while the indexed wide MV keeps both light and
-- heavy cases fast.
--
-- Contract version: RISINGWAVE_UNREAD_INBOX_CONTRACT_VERSION = 1.
-- If the Postgres inbox/unread-summary SQL semantics change, update the inline
-- PG SQL, the pg_* reference views, and this file in the same PR and rerun
-- packages/server/scripts/verify-risingwave-inbox-parity.ts against a sampled
-- PG/RW environment before enabling the RW env var.
--
-- Required CDC tables:
--   rw_channels, rw_messages, rw_channel_humans, rw_user_channel_read_cursors,
--   rw_user_channel_inbox_states, rw_thread_follows, rw_tasks,
--   rw_message_mentions, rw_server_members.
--
-- Prereq: RisingWave CDC must include the Postgres message_mentions table as
-- rw_message_mentions before applying this file. The CDC source/table DDL is
-- managed outside this repo; see:
-- https://docs.risingwave.com/ingestion/sources/postgres-cdc
--
-- Current exclusions:
--   - Per-plan history_cutoff requests stay on Postgres; these global MVs cover
--     the full retained history.
--   - User/agent display names are intentionally not materialized here. The
--     server resolves those page-bounded from Postgres to avoid adding sensitive
--     profile tables to the CDC surface.

SET BACKGROUND_DDL = true;
SET streaming_parallelism = 4;

-- Contract: rw_channel_latest_message_v1
-- Mirror reference: pg_channel_latest_message_v1 in migration
-- 0084_risingwave_pg_views.sql. Keep column names, types, and semantics
-- aligned with the PG reference view.
CREATE MATERIALIZED VIEW rw_channel_latest_message_v1 AS
SELECT
  channel_id,
  id AS message_id,
  seq AS latest_seq,
  content,
  sender_type,
  sender_id,
  created_at
FROM (
  SELECT
    m.channel_id,
    m.id,
    m.seq,
    m.content,
    m.sender_type,
    m.sender_id,
    m.created_at,
    row_number() OVER (PARTITION BY m.channel_id ORDER BY m.seq DESC, m.id DESC) AS rn
  FROM rw_messages AS m
) ranked
WHERE rn = 1;

-- Contract: rw_thread_activity_stats_v1
-- Mirror reference: pg_thread_activity_stats_v1 in migration
-- 0084_risingwave_pg_views.sql. Keep column names, types, and semantics
-- aligned with the PG reference view.
CREATE MATERIALIZED VIEW rw_thread_activity_stats_v1 AS
SELECT
  t.id AS thread_channel_id,
  count(m.id)::int AS reply_count,
  max(m.created_at) AS last_reply_at,
  latest.message_id AS latest_message_id,
  latest.content AS latest_preview,
  latest.sender_type AS latest_sender_type,
  latest.sender_id AS latest_sender_id
FROM rw_channels AS t
LEFT JOIN rw_messages AS m
  ON m.channel_id = t.id
LEFT JOIN rw_channel_latest_message_v1 AS latest
  ON latest.channel_id = t.id
WHERE t.type = 'thread'
  AND t.deleted_at IS NULL
GROUP BY
  t.id,
  latest.message_id,
  latest.content,
  latest.sender_type,
  latest.sender_id;

-- Contract: rw_user_channel_unread_v1
-- Mirror reference: pg_user_channel_unread_v1 in migration
-- 0084_risingwave_pg_views.sql. Keep column names, types, and semantics
-- aligned with the PG reference view.
CREATE MATERIALIZED VIEW rw_user_channel_unread_v1 AS
SELECT
  ch.user_id,
  c.server_id,
  c.id AS channel_id,
  COALESCE(rc.last_read_seq, 0) AS last_read_seq,
  count(m.id)::int AS unread_count,
  min(m.seq) AS first_unread_seq
FROM rw_channel_humans AS ch
JOIN rw_channels AS c
  ON c.id = ch.channel_id
LEFT JOIN rw_user_channel_read_cursors AS rc
  ON rc.channel_id = c.id
 AND rc.user_id = ch.user_id
LEFT JOIN rw_messages AS m
  ON m.channel_id = c.id
 AND m.seq > COALESCE(rc.last_read_seq, 0)
WHERE c.deleted_at IS NULL
  AND c.archived_at IS NULL
  AND c.type IN ('channel', 'private', 'dm')
GROUP BY ch.user_id, c.server_id, c.id, COALESCE(rc.last_read_seq, 0);

-- Contract: rw_sidebar_unread_summary_v1
-- This materialized view must maintain the same column names, types, and
-- semantics as the PG reference view pg_sidebar_unread_summary_v1 in migration
-- 0084_risingwave_pg_views.sql. If you change this MV, you MUST also update
-- the PG inline SQL/reference view and rerun:
--   pnpm --filter @slock-ai/server risingwave:verify-inbox-parity
CREATE MATERIALIZED VIEW rw_sidebar_unread_summary_v1 AS
SELECT
  user_id,
  server_id,
  sum(unread_count)::int AS unread_count
FROM rw_user_channel_unread_v1
WHERE unread_count > 0
GROUP BY user_id, server_id;

-- Contract: rw_user_thread_unread_v1
-- Mirror reference: pg_user_thread_unread_v1 in migration
-- 0084_risingwave_pg_views.sql. Keep column names, types, and semantics
-- aligned with the PG reference view.
CREATE MATERIALIZED VIEW rw_user_thread_unread_v1 AS
SELECT
  tf.follower_id AS user_id,
  t.server_id,
  t.id AS thread_channel_id,
  COALESCE(rc.last_read_seq, 0) AS last_read_seq,
  count(m.id)::int AS unread_count,
  min(m.seq) AS first_unread_seq
FROM rw_thread_follows AS tf
JOIN rw_channels AS t
  ON t.id = tf.thread_channel_id
LEFT JOIN rw_user_channel_read_cursors AS rc
  ON rc.channel_id = t.id
 AND rc.user_id = tf.follower_id
LEFT JOIN rw_messages AS m
  ON m.channel_id = t.id
 AND m.seq > COALESCE(rc.last_read_seq, 0)
WHERE tf.follower_type = 'user'
  AND tf.done_at IS NULL
  AND tf.unfollowed_at IS NULL
  AND t.type = 'thread'
  AND t.deleted_at IS NULL
GROUP BY tf.follower_id, t.server_id, t.id, COALESCE(rc.last_read_seq, 0);

-- Contract: rw_channel_unread_counts_v1
-- This is the dedicated serving MV for GET /api/channels/unread. It intentionally
-- does not reuse the Inbox/sidebar MVs because this endpoint includes non-joined
-- public channel unread for server members and followed thread unread with parent
-- channel access checks. SYNC REQUIRED: if the inline Postgres SQL in
-- getUnreadCounts changes membership, thread parent access, archived/deleted,
-- history-cutoff, or count semantics, update this MV and rerun:
--   pnpm --filter @slock-ai/server risingwave:verify-inbox-parity
-- The v1 MV covers full retained history. Per-plan history_cutoff requests stay
-- on Postgres until a cutoff-aware RW contract is designed.
CREATE MATERIALIZED VIEW rw_channel_unread_counts_v1 AS
WITH non_thread_eligible_channels AS (
  SELECT
    sm.user_id,
    c.server_id,
    c.id AS channel_id
  FROM rw_channels AS c
  JOIN rw_server_members AS sm
    ON sm.server_id = c.server_id
  WHERE c.deleted_at IS NULL
    AND c.archived_at IS NULL
    AND c.type NOT IN ('dm', 'private', 'thread')

  UNION ALL

  SELECT
    ch.user_id,
    c.server_id,
    c.id AS channel_id
  FROM rw_channel_humans AS ch
  JOIN rw_channels AS c
    ON c.id = ch.channel_id
  WHERE c.deleted_at IS NULL
    AND c.archived_at IS NULL
    AND c.type IN ('dm', 'private')
),
non_thread_unread AS (
  SELECT
    e.user_id,
    e.server_id,
    e.channel_id,
    count(m.id)::int AS unread_count
  FROM non_thread_eligible_channels AS e
  LEFT JOIN rw_user_channel_read_cursors AS rc
    ON rc.channel_id = e.channel_id
   AND rc.user_id = e.user_id
  JOIN rw_messages AS m
    ON m.channel_id = e.channel_id
   AND m.seq > COALESCE(rc.last_read_seq, 0)
  GROUP BY e.user_id, e.server_id, e.channel_id
),
thread_unread AS (
  SELECT
    tf.follower_id AS user_id,
    t.server_id,
    t.id AS channel_id,
    count(m.id)::int AS unread_count
  FROM rw_thread_follows AS tf
  JOIN rw_channels AS t
    ON t.id = tf.thread_channel_id
  JOIN rw_messages AS pm
    ON pm.id = t.parent_message_id
  JOIN rw_channels AS pc
    ON pc.id = pm.channel_id
  LEFT JOIN rw_channel_humans AS pch
    ON pch.channel_id = pc.id
   AND pch.user_id = tf.follower_id
  LEFT JOIN rw_user_channel_read_cursors AS rc
    ON rc.channel_id = t.id
   AND rc.user_id = tf.follower_id
  JOIN rw_messages AS m
    ON m.channel_id = t.id
   AND m.seq > COALESCE(rc.last_read_seq, 0)
  WHERE tf.follower_type = 'user'
    AND tf.done_at IS NULL
    AND tf.unfollowed_at IS NULL
    AND t.type = 'thread'
    AND t.deleted_at IS NULL
    AND pc.archived_at IS NULL
    AND (
      pc.type NOT IN ('dm', 'private')
      OR pch.user_id IS NOT NULL
    )
  GROUP BY tf.follower_id, t.server_id, t.id
)
SELECT
  user_id,
  server_id,
  channel_id,
  unread_count
FROM non_thread_unread
UNION ALL
SELECT
  user_id,
  server_id,
  channel_id,
  unread_count
FROM thread_unread;

-- Contract: rw_user_channel_mentions_v1
-- Mirror reference: pg_user_channel_mentions_v1 in migration
-- 0084_risingwave_pg_views.sql. Keep column names, types, and semantics
-- aligned with the PG reference view.
CREATE MATERIALIZED VIEW rw_user_channel_mentions_v1 AS
SELECT
  mm.target_id AS user_id,
  mm.channel_id,
  count(*)::int AS mention_count
FROM rw_message_mentions AS mm
WHERE mm.target_type = 'user'
GROUP BY mm.target_id, mm.channel_id;

-- Contract: rw_user_channel_unread_mentions_v1
-- Mirror reference: pg_user_channel_unread_mentions_v1 in migration
-- 0084_risingwave_pg_views.sql. Keep column names, types, and semantics
-- aligned with the PG reference view.
CREATE MATERIALIZED VIEW rw_user_channel_unread_mentions_v1 AS
SELECT
  mm.target_id AS user_id,
  mm.channel_id,
  COALESCE(rc.last_read_seq, 0) AS last_read_seq,
  count(*)::int AS mention_count
FROM rw_message_mentions AS mm
LEFT JOIN rw_user_channel_read_cursors AS rc
  ON rc.channel_id = mm.channel_id
 AND rc.user_id = mm.target_id
WHERE mm.target_type = 'user'
  AND mm.message_seq > COALESCE(rc.last_read_seq, 0)
GROUP BY mm.target_id, mm.channel_id, COALESCE(rc.last_read_seq, 0);

-- Contract: rw_inbox_items_v1
-- This materialized view must maintain the same column names, types, and
-- semantics as the PG reference view pg_inbox_items_v1 in migration
-- 0084_risingwave_pg_views.sql. If you change this MV, you MUST also update
-- the PG inline SQL/reference view and rerun:
--   pnpm --filter @slock-ai/server risingwave:verify-inbox-parity
CREATE MATERIALIZED VIEW rw_inbox_items_v1 AS
WITH eligible_chats AS (
  SELECT
    c.server_id,
    ch.user_id,
    c.id AS channel_id,
    CASE WHEN c.type = 'dm' THEN 'dm' ELSE 'channel' END AS item_type
  FROM rw_channels AS c
  JOIN rw_channel_humans AS ch
    ON ch.channel_id = c.id
  LEFT JOIN rw_user_channel_inbox_states AS inbox
    ON inbox.channel_id = c.id
   AND inbox.user_id = ch.user_id
  -- Keep private rows materialized for the unread filter, which matches the
  -- existing non-all PG path. The server-side all-filter serving query excludes
  -- private chats to preserve today's page-first PG behavior.
  WHERE c.type IN ('channel', 'private', 'dm')
    AND c.deleted_at IS NULL
    AND c.archived_at IS NULL
    AND inbox.done_at IS NULL
),
followed_threads AS (
  SELECT
    t.server_id,
    tf.follower_id AS user_id,
    t.id AS thread_channel_id,
    t.parent_message_id,
    pm.channel_id AS parent_channel_id
  FROM rw_thread_follows AS tf
  JOIN rw_channels AS t
    ON t.id = tf.thread_channel_id
   AND t.type = 'thread'
   AND t.deleted_at IS NULL
  JOIN rw_messages AS pm
    ON pm.id = t.parent_message_id
  JOIN rw_channels AS parent_ch
    ON parent_ch.id = pm.channel_id
   AND parent_ch.archived_at IS NULL
  WHERE tf.follower_type = 'user'
    AND tf.done_at IS NULL
    AND tf.unfollowed_at IS NULL
),
base_items AS (
  SELECT
    c.server_id,
    c.user_id,
    c.item_type AS kind,
    c.channel_id AS source_channel_id,
    NULL::varchar AS parent_message_id,
    NULL::varchar AS parent_channel_id,
    latest.latest_seq,
    latest.created_at AS activity_at
  FROM eligible_chats AS c
  JOIN rw_channel_latest_message_v1 AS latest
    ON latest.channel_id = c.channel_id
  UNION ALL
  SELECT
    t.server_id,
    t.user_id,
    'thread' AS kind,
    t.thread_channel_id AS source_channel_id,
    t.parent_message_id,
    t.parent_channel_id,
    latest.latest_seq,
    COALESCE(latest.created_at, pm.created_at) AS activity_at
  FROM followed_threads AS t
  JOIN rw_messages AS pm
    ON pm.id = t.parent_message_id
  LEFT JOIN rw_channel_latest_message_v1 AS latest
    ON latest.channel_id = t.thread_channel_id
)
SELECT
  b.server_id,
  b.user_id,
  b.kind,
  CASE WHEN b.kind = 'thread' THEN NULL::varchar ELSE b.source_channel_id END AS channel_id,
  CASE WHEN b.kind = 'thread' THEN NULL::varchar ELSE source_ch.name END AS channel_name,
  CASE WHEN b.kind = 'thread' THEN NULL::varchar ELSE source_ch.type END AS channel_type,
  latest.message_id AS last_message_id,
  first_unread.id AS first_unread_message_id,
  latest.created_at AS last_message_at,
  latest.content AS last_message_preview,
  latest.sender_type AS last_message_sender_type,
  latest.sender_id AS last_message_sender_id,
  COALESCE(tu.unread_count, cu.unread_count, 0)::int AS unread_count,
  CASE WHEN b.kind = 'thread' THEN b.source_channel_id ELSE NULL::varchar END AS thread_channel_id,
  b.parent_message_id,
  b.parent_channel_id,
  parent_ch.name AS parent_channel_name,
  parent_ch.type AS parent_channel_type,
  parent_message.content AS parent_message_preview,
  parent_message.sender_type AS parent_message_sender_type,
  parent_message.sender_id AS parent_message_sender_id,
  COALESCE(latest.content, parent_message.content) AS latest_activity_preview,
  COALESCE(latest.sender_type, parent_message.sender_type) AS latest_activity_sender_type,
  COALESCE(latest.sender_id, parent_message.sender_id) AS latest_activity_sender_id,
  COALESCE(latest.message_id, parent_message.id) AS latest_activity_message_id,
  COALESCE(latest.created_at, parent_message.created_at) AS last_activity_at,
  CASE WHEN b.kind = 'thread' THEN latest.created_at ELSE NULL::timestamptz END AS last_reply_at,
  CASE WHEN b.kind = 'thread' THEN COALESCE(thread_stats.reply_count, 0)::int ELSE NULL::int END AS reply_count,
  legacy_task.task_number,
  legacy_task.status AS task_status,
  legacy_task.claimed_by_type AS task_claimed_by_type,
  legacy_task.claimed_by_id AS task_claimed_by_id,
  COALESCE(unread_mentions.mention_count, 0) > 0 AS has_mention,
  COALESCE(tu.last_read_seq, cu.last_read_seq, 0) AS last_read_seq,
  b.activity_at,
  COALESCE(all_mentions.mention_count, 0) > 0 AS has_any_mention
FROM base_items AS b
LEFT JOIN rw_channels AS source_ch
  ON source_ch.id = b.source_channel_id
LEFT JOIN rw_messages AS parent_message
  ON parent_message.id = b.parent_message_id
LEFT JOIN rw_channels AS parent_ch
  ON parent_ch.id = b.parent_channel_id
LEFT JOIN rw_channel_latest_message_v1 AS latest
  ON latest.channel_id = b.source_channel_id
LEFT JOIN rw_user_channel_unread_v1 AS cu
  ON b.kind <> 'thread'
 AND cu.user_id = b.user_id
 AND cu.channel_id = b.source_channel_id
LEFT JOIN rw_user_thread_unread_v1 AS tu
  ON b.kind = 'thread'
 AND tu.user_id = b.user_id
 AND tu.thread_channel_id = b.source_channel_id
LEFT JOIN rw_messages AS first_unread
  ON first_unread.channel_id = b.source_channel_id
 AND first_unread.seq = COALESCE(tu.first_unread_seq, cu.first_unread_seq)
LEFT JOIN rw_thread_activity_stats_v1 AS thread_stats
  ON b.kind = 'thread'
 AND thread_stats.thread_channel_id = b.source_channel_id
LEFT JOIN rw_tasks AS legacy_task
  ON legacy_task.message_id = b.parent_message_id
LEFT JOIN rw_user_channel_mentions_v1 AS all_mentions
  ON all_mentions.user_id = b.user_id
 AND all_mentions.channel_id = b.source_channel_id
LEFT JOIN rw_user_channel_unread_mentions_v1 AS unread_mentions
  ON unread_mentions.user_id = b.user_id
 AND unread_mentions.channel_id = b.source_channel_id;

CREATE INDEX idx_rw_messages_channel_seq
  ON rw_messages (channel_id, seq);

CREATE INDEX idx_rw_message_mentions_inbox
  ON rw_message_mentions (target_type, target_id, channel_id, message_seq);

CREATE INDEX idx_rw_channel_latest_message_channel
  ON rw_channel_latest_message_v1 (channel_id);

CREATE INDEX idx_rw_thread_activity_stats_thread
  ON rw_thread_activity_stats_v1 (thread_channel_id);

CREATE INDEX idx_rw_user_channel_unread_lookup
  ON rw_user_channel_unread_v1 (user_id, channel_id);

CREATE INDEX idx_rw_user_thread_unread_lookup
  ON rw_user_thread_unread_v1 (user_id, thread_channel_id);

CREATE INDEX idx_rw_channel_unread_counts_lookup
  ON rw_channel_unread_counts_v1 (server_id, user_id, channel_id);

CREATE INDEX idx_rw_user_channel_mentions_lookup
  ON rw_user_channel_mentions_v1 (user_id, channel_id);

CREATE INDEX idx_rw_user_channel_unread_mentions_lookup
  ON rw_user_channel_unread_mentions_v1 (user_id, channel_id);

CREATE INDEX idx_rw_sidebar_unread_summary_lookup
  ON rw_sidebar_unread_summary_v1 (user_id, server_id);

CREATE INDEX idx_rw_inbox_items_user_activity
  ON rw_inbox_items_v1 (server_id, user_id, activity_at);

-- The wide inbox serving MV must be indexed before it is used for serving.
-- Without these indexes, light-user queries can spend most of their time
-- scanning the materialized rows even though the joins have already been paid.
CREATE INDEX idx_rw_inbox_items_user_filter
  ON rw_inbox_items_v1 (server_id, user_id, kind, unread_count, has_any_mention);
