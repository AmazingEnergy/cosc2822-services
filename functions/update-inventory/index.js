const {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
  DeleteItemCommand,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const inventoryTableName = process.env.INVENTORY_TABLE_NAME || "Inventory";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);

  try {
    if (!event.code) {
      callback(new Error("[BadRequest] code is missing."));
      return;
    }

    if (
      !event.body.quantity ||
      event.body.quantity <= 0 ||
      isNaN(event.body.quantity)
    ) {
      callback(new Error("[BadRequest] quantity is missing or invalid."));
      return;
    }

    let params = {
      TableName: inventoryTableName,
      Key: {
        stockCode: {
          S: event.code,
        },
      },
      UpdateExpression: "SET #q = :quantity",
      ExpressionAttributeValues: {
        ":quantity": { N: event.body.quantity.toString() },
      },
      ExpressionAttributeNames: {
        "#q": "quantity",
      },
      ReturnValues: "ALL_NEW",
    };

    console.log("Params: ", JSON.stringify(params));

    let inventoryResponse = await client.send(new UpdateItemCommand(params));

    console.log("Updated inventory data: ", JSON.stringify(inventoryResponse));

    inventoryResponse = await client.send(
      new GetItemCommand({
        TableName: inventoryTableName,
        Key: {
          stockCode: {
            S: event.code,
          },
        },
      })
    );

    return {
      statusCode: 200,
      body: unmarshall(inventoryResponse.Item),
    };
  } catch (error) {
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
