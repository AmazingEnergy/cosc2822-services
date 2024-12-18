const AWS = require("aws-sdk");

// Initialize AWS SDK clients
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = "Product";

exports.handler = async (event) => {
  try {
    if (!event.skuId || !event.parentSkuId) {
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
        parentSkuId: {
          S: event.parentSkuId,
        },
      },
    };
    let data = await dynamoDb.getItem(params).promise();
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
