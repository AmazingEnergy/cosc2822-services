const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const productTableName = process.env.TABLE_NAME || "ProductV2";
const inventoryTableName = process.env.INVENTORY_TABLE_NAME || "Inventory";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);

  try {
    if (!event.skuId) {
      callback(new Error("[BadRequest] Missing product skuId"));
    }

    let params = {
      TableName: productTableName,
      Key: {
        skuId: {
          S: event.skuId,
        },
      },
    };

    console.log("Params: ", JSON.stringify(params));

    const productResponse = await client.send(new GetItemCommand(params));

    if (!productResponse.Item) {
      callback(new Error("[NotFound] Product not found"));
    }

    const product = unmarshall(productResponse.Item);

    const inventoryResponse = await client.send(
      new GetItemCommand({
        TableName: inventoryTableName,
        Key: {
          stockCode: {
            S: product.stockCode,
          },
        },
      })
    );

    if (inventoryResponse.Item) {
      product.inventory = unmarshall(inventoryResponse.Item);
    }

    return {
      statusCode: 200,
      body: product,
    };
  } catch (error) {
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
