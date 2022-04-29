#!/bin/zsh

nw() {
  npm run $1 -w packages/piano-$2
}