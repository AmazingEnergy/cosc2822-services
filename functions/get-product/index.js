const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const tableName = process.env.TABLE_NAME || "ProductV2";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);

  try {
    if (!event.skuId) {
      callback(new Error("[BadRequest] Missing product skuId"));
    }

    let params = {
      TableName: tableName,
      Key: {
        skuId: {
          S: event.skuId,
        },
      },
    };

    console.log("Params: ", JSON.stringify(params));

    const command = new GetItemCommand(params);
    const data = await client.send(command);

    if (!data.Item) {
      callback(new Error("[NotFound] Product not found"));
    }

    return {
      statusCode: 200,
      body: data.Item,
    };
  } catch (error) {
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
