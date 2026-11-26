#!/bin/zsh

# Runs an npm script in one package: `nw test vue` or `nw test lib`.
nw() {
  local package=piano-$2
  [[ $2 == lib ]] && package=music-theory
  npm run $1 -w packages/$package
}
