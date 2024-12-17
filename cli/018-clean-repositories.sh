#!/bin/bash

# remember to change permission
# chmod 700 get-started.sh

REGION=${1:-ap-southeast-1}

mkdir ./_output
mkdir ./_output/clean-repositories
OUTPUT_DIR="./_output/clean-repositories"

EXISTING_REPOSITORIES=$(aws ecr describe-repositories \
	--query "repositories[repositoryName]" \
	--region $REGION \
	--output text)

echo "Found all existing repositories: $EXISTING_REPOSITORIES"
echo ""

# TODO: loop each repository and delete