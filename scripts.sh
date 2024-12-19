#!/bin/bash

# remember to change permission
# chmod +x scripts.sh

POSITIONAL=()

# load args default value
AWS_PROFILE=${COSC2822_INFRAS_AWS_PROFILE:-""}
CFN_STACK_NAME=${COSC2822_INFRAS_AWS_PROFILE:-"intro-ec2-launch"}
CFN_TEMPLATE=${COSC2822_INFRAS_AWS_PROFILE:-"cfn-samples/00-intro/0-ec2-launch-001.yaml"}

# Process named parameters
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --action) ACTION="$2"; shift ;;
    --region) REGION="$2"; shift ;;
    --aws-profile) AWS_PROFILE="$2"; shift ;;
    --cfn-stack-name) CFN_STACK_NAME="$2"; shift ;;
    --cfn-template) CFN_TEMPLATE="$2"; shift ;;
    --cfn-params) CFN_TEMPLATE_PARAMS="$2"; shift ;;
    --cfn-output-key) CFN_OUTPUT_KEY="$2"; shift ;;
    --s3-resource-path) S3_RESOURCE_PATH="$2"; shift ;;
    --route53-domain-name) ROUTE53_DOMAIN_NAME="$2"; shift ;;
    --route53-name-servers) ROUTE53_NAME_SERVERS="$2"; shift ;;
    --route53-hosted-zone) ROUTE53_HOSTED_ZONE="$2"; shift ;;
    --aws-service-name) AWS_SERVICE_NAME="$2"; shift ;;
    --oidc-provider-url) IAM_OIDC_PROVIDER_URL="$2"; shift ;;
    --oidc-audience) IAM_OIDC_AUDIENCE="$2"; shift ;;
    --oidc-thumbprint) IAM_OIDC_THUMBPRINT="$2"; shift ;;
    --github-org) GITHUB_ORG="$2"; shift ;;
    --username) USERNAME="$2"; shift ;;
    --password) PASSWORD="$2"; shift ;;
    --container-registry) CONTAINER_REGISTRY="$2"; shift ;;
    --image-tag) IMAGE_TAG="$2"; shift ;;
    --container-repository) CONTAINER_REPOSITORY="$2"; shift ;;
    *) POSITIONAL+=("$1") ;; # Collect positional arguments
  esac
  shift
done

# Restore positional arguments
set -- "${POSITIONAL[@]}"

if [[ -z "$ACTION" ]]; then
	echo "arg --action is required."
	exit 1
fi

if [ -n "$AWS_PROFILE" ]; then
	unset AWS_ACCESS_KEY_ID
	unset AWS_SECRET_ACCESS_KEY
	unset AWS_DEFAULT_PROFILE
	export AWS_DEFAULT_PROFILE=$AWS_PROFILE
	echo "Set default AWS CLI profile ${AWS_DEFAULT_PROFILE}"
	echo ""
fi

chmod +x ./cli/013-check-iam-caller.sh
./cli/013-check-iam-caller.sh

#######################################################
# Deployment
#######################################################

if [[ "$ACTION" == "deploy-all-stacks" ]]; then
	chmod +x ./cli/002-run-cfn.sh

	sed -i -e "s/<Route53DNSStack>/route53-dns-stack/g" ./apigw-endpoints-params.json
	sed -i -e "s/<ApiGatewayStack>/api-gateway-stack/g" ./apigw-endpoints-params.json

	./cli/002-run-cfn.sh apigw-endpoints-stack apigw-endpoints.yaml apigw-endpoints-params.json $REGION

	# sed -i -e "s/<ApiGatewayStack>/api-gateway-stack/g" ./functions/get-products/cfn-template-params.json
	# sed -i -e "s/<EndpointsStack>/apigw-endpoints-stack/g" ./functions/get-products/cfn-template-params.json
	# sed -i -e "s/<ContainerRegistry>/$CONTAINER_REGISTRY/g" ./functions/get-products/cfn-template-params.json
	# sed -i -e "s/<ImageTag>/$IMAGE_TAG/g" ./functions/get-products/cfn-template-params.json

	# ./cli/002-run-cfn.sh get-products-function-stack functions/get-products/cfn-template.yaml functions/get-products/cfn-template-params.json $REGION
  
  for dir in ./functions/*/; do
    if [ -d "$dir" ]; then
      function_name=$(basename "$dir")
      if [ ! -f "$dir/cfn-template.yaml" ]; then
        echo "Skipping $function_name"
        continue
      fi

      sed -i -e "s/<ApiGatewayStack>/api-gateway-stack/g" "$dir/cfn-template-params.json"
      sed -i -e "s/<EndpointsStack>/apigw-endpoints-stack/g" "$dir/cfn-template-params.json"
      sed -i -e "s/<ContainerRegistry>/$CONTAINER_REGISTRY/g" "$dir/cfn-template-params.json"
      sed -i -e "s/<ImageTag>/$IMAGE_TAG/g" "$dir/cfn-template-params.json"
      sed -i -e "s/<FunctionRepository>/$function_name-func/g" "$dir/cfn-template-params.json"

      non_prefix_dir=${dir#./}
      ./cli/002-run-cfn.sh "$function_name-function-stack" "$non_prefix_dir/cfn-template.yaml" "$non_prefix_dir/cfn-template-params.json" $REGION
    fi
  done

	exit 0
fi

if [[ "$ACTION" == "destroy-all-stacks" ]]; then
	chmod +x ./cli/005-delete-stack.sh

	./cli/005-delete-stack.sh get-products-function-stack $REGION
	./cli/005-delete-stack.sh apigw-endpoints-stack $REGION
	exit 0
fi

#######################################################
# Utils
#######################################################

if [[ "$ACTION" == "deploy-agw" ]]; then
  chmod +x ./cli/008-get-cfn-output.sh
	API_GW_ID=$(./cli/008-get-cfn-output.sh api-gateway-stack ApiGateway $REGION)

  chmod +x ./cli/019-auto-deploy-agw.sh
  ./cli/019-auto-deploy-agw.sh $API_GW_ID dev $IMAGE_TAG $REGION
  exit 0
fi

if [[ "$ACTION" == "create-repository" ]]; then
	chmod +x ./cli/017-create-repository.sh

  for dir in ./functions/*/; do
    if [ -d "$dir" ]; then
      function_name=$(basename "$dir")
      if [ ! -f "$dir/Dockerfile" ]; then
        echo "Skipping $function_name"
        continue
      fi

      ./cli/017-create-repository.sh "$function_name-func" $REGION
      docker build -t $CONTAINER_REGISTRY/"$function_name-func":$IMAGE_TAG "$dir"
      docker push $CONTAINER_REGISTRY/"$function_name-func":$IMAGE_TAG
    fi
  done
	exit 0
fi

if [[ "$ACTION" == "clean-repositories" ]]; then
	chmod +x ./cli/018-clean-repositories.sh
	./cli/018-clean-repositories.sh $REGION
	exit 0
fi