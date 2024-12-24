const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const promotionCodeTableName = process.env.TABLE_NAME || "PromotionCodeV2";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);
  try {
    let limit = 10;
    if (event.limit && !isNaN(event.limit)) {
      limit = parseInt(event.limit);
    }

    let params = {
      TableName: promotionCodeTableName,
      Limit: limit,
    };

    if (event.lastEvaluatedKey && event.lastEvaluatedKey !== "") {
      params.ExclusiveStartKey = {
        code: { S: event.lastEvaluatedKey },
      };
    }

    if (event.name) {
      if (params.FilterExpression && params.FilterExpression.length > 0) {
        params.FilterExpression += " AND ";
      }
      params.FilterExpression +=
        "(begins_with(#name, :prefix) OR contains(#name, :subString))";
      params.ExpressionAttributeNames["#name"] = "lowerCaseName";
      params.ExpressionAttributeValues[":prefix"] = {
        S: event.name.toLowerCase(),
      };
      params.ExpressionAttributeValues[":subString"] = {
        S: event.name.toLowerCase(),
      };
    }

    if (event.code) {
      if (params.FilterExpression && params.FilterExpression.length > 0) {
        params.FilterExpression += " AND ";
      }
      params.FilterExpression += "#code = :code";
      params.ExpressionAttributeNames["#code"] = "code";
      params.ExpressionAttributeValues[":code"] = { S: event.code };
    }

    console.log("Params: ", JSON.stringify(params));

    const promotionCodeResponse = await client.send(new ScanCommand(params));

    console.log(
      "Scanned promotion code data: ",
      JSON.stringify(promotionCodeResponse)
    );

    const promotionCodes = promotionCodeResponse.Items.map((item) =>
      unmarshall(item)
    );

    console.log(
      "Unmarshalled promotion code data: ",
      JSON.stringify(promotionCodes)
    );

    if (promotionCodeResponse.LastEvaluatedKey) {
      return {
        statusCode: 200,
        body: {
          items: promotionCodes,
          lastEvaluatedKey: unmarshall(promotionCodeResponse.LastEvaluatedKey)
            .code,
        },
      };
    }

    return { statusCode: 200, body: { items: promotionCodes } };
  } catch (error) {
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
