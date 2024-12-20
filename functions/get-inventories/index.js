const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const inventoryTableName = process.env.INVENTORY_TABLE_NAME || "Inventory";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);
  try {
    limit = 10;
    if (event.limit && !isNaN(event.limit)) {
      limit = parseInt(event.limit);
    }

    let params = {
      TableName: inventoryTableName,
      Limit: limit,
      FilterExpression: "#i = :active",
      ExpressionAttributeNames: {
        "#i": "isActive",
      },
      ExpressionAttributeValues: {
        ":active": { BOOL: true },
      },
    };

    if (event.lastEvaluatedKey && event.lastEvaluatedKey !== "") {
      params.ExclusiveStartKey = {
        stockCode: { S: event.lastEvaluatedKey },
      };
    }

    if (event.stockCode) {
      params.FilterExpression += " AND begins_with(#s, :prefix)";
      params.ExpressionAttributeNames["#s"] = "stockCode";
      params.ExpressionAttributeValues[":prefix"] = {
        S: event.stockCode,
      };
    }

    console.log("Params: ", JSON.stringify(params));

    const inventoryResponse = await client.send(new ScanCommand(params));

    console.log("Scanned inventory data: ", JSON.stringify(inventoryResponse));

    const inventories = inventoryResponse.Items.map((item) => unmarshall(item));

    console.log("Unmarshalled inventory data: ", JSON.stringify(inventories));

    if (inventoryResponse.LastEvaluatedKey) {
      return {
        statusCode: 200,
        body: {
          items: inventories,
          lastEvaluatedKey: unmarshall(inventoryResponse.LastEvaluatedKey)
            .stockCode,
        },
      };
    }

    return { statusCode: 200, body: { items: inventories } };
  } catch (error) {
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
