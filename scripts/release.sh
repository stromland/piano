#!/usr/bin/env bash
#
# Bumps the version of every package, commits the change and tags the commit.
# Pushing the tag deploys the site to GitHub Pages.
#
# Usage: scripts/release.sh <patch|minor|major|x.y.z>

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <patch|minor|major|x.y.z>" >&2
  exit 1
fi

cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain)" ]; then
  echo "Commit or stash your changes before releasing." >&2
  exit 1
fi

npm version "$1" --workspaces --include-workspace-root --no-git-tag-version

VERSION=$(npm pkg get version --workspaces=false | tr -d '"')

git commit --all --message "chore(release): $VERSION"
git tag "v$VERSION"

echo "Tagged v$VERSION. Deploy it with: git push && git push origin v$VERSION"
