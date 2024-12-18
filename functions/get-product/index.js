const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const tableName = process.env.TABLE_NAME || "ProductV2";

exports.handler = async (event) => {
  console.log("Received Event: ", event);

  try {
    if (!event.skuId) {
      return {
        statusCode: 400,
        body: { error: "Missing product skuId" },
      };
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
      return {
        statusCode: 404,
        body: { error: "[NotFound] Product not found" },
      };
    }

    return {
      statusCode: 200,
      body: data.Item,
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: { error: "Something went wrong." },
    };
  }
};
