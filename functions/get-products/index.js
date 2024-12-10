const AWS = require("aws-sdk");

// Initialize AWS SDK clients
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = "Product";

exports.handler = async (event) => {
  try {
    let params = {
      TableName: tableName,
      Limit: 10,
      // Add your KeyConditionExpression and other query parameters here
      // Example:
      // KeyConditionExpression: 'partitionKey = :partitionKeyValue',
      // ExpressionAttributeValues: {
      //   ':partitionKeyValue': 'yourPartitionKeyValue'
      // }
    };

    if (event.lastEvaluatedKey) {
      params.ExclusiveStartKey = event.lastEvaluatedKey;
    }

    let data = await dynamoDb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: data.Items,
        lastEvaluatedKey: data.LastEvaluatedKey,
      }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Something went wrong." }),
    };
  }
};
