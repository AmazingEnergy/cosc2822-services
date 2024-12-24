#!/bin/bash

USER_POO_ID=$1
LAMBDA_ARN=$2
REGION=${3:-ap-northeast-1}

aws cognito-idp update-user-pool \
  --user-pool-id $USER_POO_ID \
  --lambda-config PreSignUp=$LAMBDA_ARN \
  --region $REGION