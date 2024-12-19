const { STSClient, GetCallerIdentityCommand } = require("@aws-sdk/client-sts");
const {
  SSMClient,
  GetParameterCommand,
  GetParametersCommand,
} = require("@aws-sdk/client-ssm");

var _localOnlySecrets = {
  // "/shop/userPoolId": process.env.LOCAL_ONLY_COGNITO_USER_POOL_ID,
  // "/shop/userPoolClientId": process.env.LOCAL_ONLY_COGNITO_USER_POOL_CLIENT_ID,
  // "/shop/userPoolRedirectUri":
  //   process.env.LOCAL_ONLY_COGNITO_USER_POOL_REDIRECT_URI,
  // "/shop/cognitoDomain": process.env.LOCAL_ONLY_COGNITO_DOMAIN,
  "/shop/dbUrl": process.DB_URL_SECRET_NAME,
  "/shop/dbPort": process.DB_PORT_SECRET_NAME,
  "/shop/dbName": process.DB_NAME_SECRET_NAME,
  "/shop/dbUsername": process.DB_USERNAME_SECRET_NAME,
  "/shop/dbPassword": process.DB_PASSWORD_SECRET_NAME,
};

var _remoteSecrets = {};

module.exports.loadSecrets = async () => {
  await callerCheck();

  const client = new SSMClient({
    region: process.env.REGION_STR,
  });
  const response = await client.send(
    new GetParametersCommand({
      Names: Object.keys(_localOnlySecrets),
      WithDecryption: true,
    })
  );

  for (var key in _localOnlySecrets) {
    console.log("Load secret value with key: ", key);
    let parameter = response.Parameters.find((p) => p.Name === key);
    console.log(
      "Retrieved secret value from SSM Pamaeter Store: ",
      parameter.ARN
    );
    _remoteSecrets[key] = parameter.Value;
  }

  console.log("Successfully load all secrets.");
};

module.exports.getSecretValue = (secretName) => {
  if (process.env.NODE_ENV === "local") return _localOnlySecrets[secretName];
  return _remoteSecrets[secretName];
};

const callerCheck = async () => {
  const client = new STSClient({
    region: process.env.REGION_STR,
  });
  const command = new GetCallerIdentityCommand({});
  const response = await client.send(command);
  console.log(
    `AWS commands with AccountId: ${response.Account} UserId: ${response.UserId} ARN: ${response.Arn}`
  );
};

/**
 * @deprecated
 */
const resolveSecretValue = async (secretName) => {
  if (process.env.NODE_ENV === "local") return _localOnlySecrets[secretName];

  const client = new SSMClient({
    region: process.env.REGION_STR,
  });
  const response = await client.send(
    new GetParameterCommand({
      Name: secretName,
      WithDecryption: true,
    })
  );

  console.log(
    "Retrieved secret value from SSM Pamaeter Store: ",
    response.Parameter.ARN
  );
  return response.Parameter.Value;
};
