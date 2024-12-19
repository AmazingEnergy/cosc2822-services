#!/bin/bash

API_GW_ID=$1
API_GW_STAGE=$2
DEPLOY_DESC=$3
REGION=${4:-ap-southeast-1}

echo "Deploying API Gateway $API_GW_ID to $API_GW_STAGE"
echo "Description: $DEPLOY_DESC"
echo "Region: $REGION"

aws apigateway create-deployment \
  --rest-api-id $API_GW_ID \
  --stage-name $API_GW_STAGE \
  --description $DEPLOY_DESC \
  --region $REGION
