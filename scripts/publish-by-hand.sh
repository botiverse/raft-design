#!/usr/bin/env bash
# Publishes the version in packages/ui/package.json to npm from your machine,
# then creates its GitHub Release. Use it only where the tag-triggered workflow
# can't publish: the first release of a package name (npm accepts a trusted
# publisher only for a package that exists), or while trusted publishing is
# being repaired. After the first release, configure the trusted publisher on
# npmjs.com (repository botiverse/raft-design, workflow publish.yml) so tags
# publish on their own.
#
#   npm login            # an account with publish rights in the @botiverse org
#   scripts/publish-by-hand.sh
set -euo pipefail
cd "$(dirname "$0")/.."

name="$(node -p "require('./packages/ui/package.json').name")"
version="$(node -p "require('./packages/ui/package.json').version")"
tag="v$version"

git fetch --quiet origin --tags
if [ -n "$(git status --porcelain)" ]; then echo "The worktree has changes; commit or stash them first." >&2; exit 1; fi
if [ "$(git rev-parse HEAD)" != "$(git rev-parse "$tag^{commit}" 2>/dev/null)" ]; then
  echo "Check out $tag first: git checkout $tag" >&2; exit 1
fi
if ! npm whoami >/dev/null 2>&1; then echo "Run npm login first." >&2; exit 1; fi

if npm view "$name@$version" version >/dev/null 2>&1; then
  echo "$name@$version is already on npm."
else
  pnpm install --frozen-lockfile
  pnpm exec vp run "$name#build"
  out="$(mktemp -d)"
  pnpm exec vp pm pack --filter "$name" --pack-destination "$out"
  npm publish "$out"/*.tgz --access public
  echo "Published $name@$version."
fi

if gh release view "$tag" >/dev/null 2>&1; then
  echo "GitHub Release $tag exists."
else
  notes="$(mktemp)"
  node scripts/release-notes.mjs "$tag" > "$notes"
  gh release create "$tag" --title "$tag" --notes-file "$notes" --verify-tag
fi
echo "Done. Next: npmjs.com > $name > Settings > Trusted Publisher > GitHub Actions: botiverse / raft-design / publish.yml"
