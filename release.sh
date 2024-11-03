#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Check if release type is provided
if [ -z "$1" ]; then
  echo "Error: Release type (alpha, beta, or stable) is required."
  exit 1
fi

RELEASE_TYPE=$1
BRANCH="release/$RELEASE_TYPE"

# Validate release type
if [[ "$RELEASE_TYPE" != "alpha" && "$RELEASE_TYPE" != "beta" && "$RELEASE_TYPE" != "stable" ]]; then
  echo "Error: Invalid release type. Valid options are 'alpha', 'beta', or 'stable'."
  exit 1
fi

# Ensure we are on master
CURRENT_BRANCH=$(git symbolic-ref --short HEAD)
if [ "$CURRENT_BRANCH" != "master" ]; then
  echo "Error: You must be on the 'master' branch to run this script."
  exit 1
fi

# Check for clean git status
if [[ -n $(git status --porcelain) ]]; then
  echo "Error: Working tree is not clean. Please commit or stash changes on 'master' before proceeding."
  exit 1
fi

# Pull latest changes on master (if any)
echo "Pulling latest changes on master..."
git pull origin master || echo "No remote changes to pull from master"

# Checkout the release branch or create it if it doesn't exist
if git rev-parse --verify "$BRANCH" >/dev/null 2>&1; then
  git checkout "$BRANCH"
else
  echo "Branch $BRANCH does not exist. Creating it."
  git checkout -b "$BRANCH"
fi

# Rebase the release branch on the latest local master
git rebase master

# Run the appropriate release script from package.json
if [ "$RELEASE_TYPE" == "alpha" ]; then
  npm run release:alpha
elif [ "$RELEASE_TYPE" == "beta" ]; then
  npm run release:beta
else
  npm run release
fi

# Push the changes with tags
git push origin "$BRANCH" --follow-tags

echo "Release for $RELEASE_TYPE completed and pushed to $BRANCH."