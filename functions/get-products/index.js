const AWS = require("aws-sdk");

// Initialize AWS SDK clients
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = "Product";

exports.handler = async (event) => {
  console.log("Received Event: ", event);
  try {
    let params = {
      TableName: tableName,
      Limit: event.limit || 10,
      FilterExpression: "attribute_exists(parentSkuId)",
      ExpressionAttributeValues: {},
    };

    if (event.lastEvaluatedKey && event.lastEvaluatedKey !== "") {
      params.ExclusiveStartKey = event.lastEvaluatedKey;
    }

    if (event.name) {
      params.FilterExpression +=
        " AND begins_with(name, :name) AND contains(name, :name)";
      params.ExpressionAttributeValues[":name"] = { S: event.name };
    }

    let data = await dynamoDb.scan(params).promise();

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
      body: { error: "Something went wrong." },
    };
  }
};
