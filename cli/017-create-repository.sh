#!/bin/bash

# remember to change permission
# chmod 700 get-started.sh

REPOSITORY_NAME=$1
REGION=${2:-ap-southeast-1}

mkdir ./_output
mkdir ./_output/create-repository
OUTPUT_DIR="./_output/create-repository"

EXISTING_REPOSITORY=$(aws ecr describe-repositories \
	--query "repositories[?repositoryName=='$REPOSITORY_NAME']" \
	--output text)

echo "Found existing repository: $EXISTING_REPOSITORY"
echo ""

if [[ -z "$EXISTING_REPOSITORY" || "$EXISTING_REPOSITORY" == "None" ]]; then
	aws ecr create-repository --repository-name get-products-func --region $REGION
fi