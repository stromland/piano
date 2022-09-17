npm version $1 --workspaces --include-workspace-root --no-git-tag-version

VERSION=$(cat package.json | jq -r .version)

git commit -am "chore(release): $VERSION"

git tag v$VERSION
