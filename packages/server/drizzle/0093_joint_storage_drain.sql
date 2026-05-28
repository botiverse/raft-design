WITH legacy_joint AS (
  SELECT jc.id
  FROM joint_channels jc
  JOIN joint_channel_servers jcs
    ON jcs.joint_channel_id = jc.id
   AND jcs.local_channel_id = jc.canonical_channel_id
  WHERE jc.status = 'active'
    AND jcs.status = 'active'
), closed_projections AS (
  UPDATE joint_channel_servers jcs
     SET status = 'disconnected',
         disconnected_at = COALESCE(disconnected_at, now())
    FROM legacy_joint legacy
   WHERE jcs.joint_channel_id = legacy.id
     AND jcs.status = 'active'
  RETURNING jcs.local_channel_id
), closed_joint AS (
  UPDATE joint_channels jc
     SET status = 'closed',
         updated_at = now()
    FROM legacy_joint legacy
   WHERE jc.id = legacy.id
  RETURNING jc.id
)
UPDATE channels c
   SET deleted_at = COALESCE(deleted_at, now()),
       archived_at = COALESCE(archived_at, now())
  FROM closed_projections projection
 WHERE c.id = projection.local_channel_id
   AND c.deleted_at IS NULL;
