# Self-hosted Redis on Fly.io

Internal Redis for cross-replica communication (pub/sub, machine routing, activity sync).
Runs on Fly internal network — no public exposure, no bandwidth fees.

## Staging

All commands run from the **project root directory**.

```bash
# 1. Create the app
fly apps create slock-redis-staging

# 2. Create volume (1GB, sin region)
fly volumes create redis_data --region sin --size 1 -a slock-redis-staging

# 3. Generate and set password
REDIS_PASS=$(openssl rand -hex 16)
echo "Save this password: $REDIS_PASS"
fly secrets set REDIS_PASSWORD=$REDIS_PASS -a slock-redis-staging

# 4. Deploy (from project root, --local-only required for first deploy)
fly deploy --config infra/redis/fly.staging.toml -a slock-redis-staging --local-only

# 5. Set REDIS_URL on the server app
fly secrets set REDIS_URL="redis://:${REDIS_PASS}@slock-redis-staging.internal:6379" -a slock-server-staging

# 6. Restart server to pick up REDIS_URL
fly machines restart -a slock-server-staging
```

## Production

All commands run from the **project root directory**.

```bash
# 1. Create the app
fly apps create slock-redis

# 2. Create volume (1GB, sin region)
fly volumes create redis_data --region sin --size 1 -a slock-redis

# 3. Generate and set password
REDIS_PASS=$(openssl rand -hex 16)
echo "Save this password: $REDIS_PASS"
fly secrets set REDIS_PASSWORD=$REDIS_PASS -a slock-redis

# 4. Deploy (from project root, --local-only required for first deploy)
fly deploy --config infra/redis/fly.toml -a slock-redis --local-only

# 5. Set REDIS_URL on the server app
fly secrets set REDIS_URL="redis://:${REDIS_PASS}@slock-redis.internal:6379" -a slock-server

# 6. Restart server to pick up REDIS_URL
fly machines restart -a slock-server
```

## Connection

Server connects via Fly internal DNS: `redis://:password@slock-redis.internal:6379`
- No public IP, only reachable from within the same Fly org
- Latency <1ms (same region)
- No bandwidth charges (internal network)

## Persistence

Uses AOF (append-only file) on a Fly volume. Data survives restarts.
`maxmemory-policy noeviction` rejects writes if memory limit is hit (all keys have TTL, so memory won't grow unbounded in normal operation).

## Updating

Redis rarely needs updates. To redeploy (e.g., config change or version bump):

```bash
# Staging
fly deploy --config infra/redis/fly.staging.toml -a slock-redis-staging --local-only

# Production
fly deploy --config infra/redis/fly.toml -a slock-redis --local-only
```

Note: redeploying Redis causes a brief disconnection (~5s). All server-side Redis consumers auto-reconnect.
