const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const tableName = process.env.TABLE_NAME || "ProductV2";

exports.handler = async (event) => {
  console.log("Received Event: ", event);
  try {
    let params = {
      TableName: tableName,
      Limit: event.limit || 10,
      FilterExpression:
        "attribute_exists(#productSkuId) AND #isActive = :active ",
      ExpressionAttributeNames: {
        "#productSkuId": "productSkuId",
        "#isActive": "isActive",
      },
      ExpressionAttributeValues: {
        ":active": { BOOL: true },
      },
    };

    if (event.lastEvaluatedKey && event.lastEvaluatedKey !== "") {
      params.ExclusiveStartKey = event.lastEvaluatedKey;
    }

    if (event.name) {
      params.FilterExpression += " AND begins_with(#name, :prefix)";
      params.ExpressionAttributeNames["#name"] = "name";
      params.ExpressionAttributeValues[":prefix"] = { S: event.name };
    }

    console.log("Params: ", JSON.stringify(params));

    const command = new ScanCommand(params);
    const data = await client.send(command);

    return {
      statusCode: 200,
      body: {
        items: data.Items,
        lastEvaluatedKey: data.LastEvaluatedKey,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: { error: "[InternalServerError] Something went wrong." },
    };
  }
};
