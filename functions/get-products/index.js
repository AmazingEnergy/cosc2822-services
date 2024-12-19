const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const tableName = process.env.TABLE_NAME || "ProductV2";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);
  try {
    let params = {
      TableName: tableName,
      Limit: int.parse(event.limit) || 10,
      FilterExpression: "attribute_exists(#s) AND #i = :active",
      ExpressionAttributeNames: {
        "#s": "skuId",
        "#i": "isActive",
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
        items: data.Items.map((item) => unmarshall(item)),
        lastEvaluatedKey: data.LastEvaluatedKey,
      },
    };
  } catch (error) {
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
