#!/bin/bash

USER_POO_ID=$1
LAMBDA_ARN=$2
REGION=${3:-ap-northeast-1}

aws cognito-idp update-user-pool \
  --user-pool-id $USER_POO_ID \
  --auto-verified-attributes "email" \
  --lambda-config PostConfirmation=$LAMBDA_ARN \
  --region $REGION