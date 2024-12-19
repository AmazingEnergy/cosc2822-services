const CognitoExpress = require("cognito-express");
const { getSecretValue } = require("./awsConnector");

/**
 * @type {CognitoExpress}
 */
let cognitoExpressSession;

module.exports.cognitoExpressSession = async () => {
  if (!cognitoExpressSession) {
    const userPoolId = getSecretValue(
      process.env.COGNITO_USER_POOL_ID_SECRET_NAME
    );

    cognitoExpressSession = new CognitoExpress({
      region: process.env.REGION_STR || "us-east-1",
      cognitoUserPoolId: userPoolId,
      tokenUse: "id",
      tokenExpiration: Number(process.env.TIMEOUT_STR) || 3600 * 1000, //Up to default expiration of 1 hour (3600000 ms)
    });
    console.log("Successfully initialize cognito express.");
  }
  return cognitoExpressSession;
};
