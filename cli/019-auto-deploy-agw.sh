#!/bin/bash

API_GW_ID=$1
API_GW_STAGE=$2
DEPLOY_DESC=$3
REGION=$4

aws apigateway create-deployment \
  --rest-api-id $API_GW_ID \
  --stage-name $API_GW_STAGE \
  --description $DEPLOY_DESC \
  --region $REGION
