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
	--region $REGION \
	--output text)

echo "Found existing repository: $EXISTING_REPOSITORY"
echo ""

if [[ -z "$EXISTING_REPOSITORY" || "$EXISTING_REPOSITORY" == "None" ]]; then
	aws ecr create-repository --repository-name $EXISTING_REPOSITORY --region $REGION
fi

aws ecr set-repository-policy \
    --repository-name $REPOSITORY_NAME \
    --policy-text file://cli/json/ecr-repository-policy.json \
		--region $REGION