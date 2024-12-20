const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const inventoryTableName = process.env.INVENTORY_TABLE_NAME || "Inventory";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);

  try {
    if (!event.code) {
      callback(new Error("[BadRequest] Missing stock code"));
    }

    let params = {
      TableName: inventoryTableName,
      Key: {
        stockCode: {
          S: event.code,
        },
      },
    };

    console.log("Params: ", JSON.stringify(params));

    const inventoryResponse = await client.send(new GetItemCommand(params));

    if (!inventoryResponse.Item) {
      callback(new Error("[NotFound] Inventory not found"));
    }

    const inventory = unmarshall(inventoryResponse.Item);

    return { statusCode: 200, body: inventory };
  } catch (error) {
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
