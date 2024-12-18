const AWS = require("aws-sdk");

// Initialize AWS SDK clients
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = "Product";

exports.handler = async (event) => {
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
        skuId: event.skuId,
      },
    };
    let data = await dynamoDb.get(params).promise();
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
