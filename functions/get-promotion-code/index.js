const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const promotionCodeTableName = process.env.TABLE_NAME || "PromotionCodeV2";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);

  try {
    if (!event.code) {
      callback(new Error("[BadRequest] Missing promotion code"));
    }

    let params = {
      TableName: promotionCodeTableName,
      Key: {
        code: {
          S: event.code,
        },
      },
    };

    console.log("Params: ", JSON.stringify(params));

    const promotionCodeResponse = await client.send(new GetItemCommand(params));

    if (!promotionCodeResponse.Item) {
      callback(new Error("[NotFound] PromotionCode not found"));
    }

    const promotionCode = unmarshall(promotionCodeResponse.Item);

    return {
      statusCode: 200,
      body: promotionCode,
    };
  } catch (error) {
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
