const AWS = require("aws-sdk");

// Initialize AWS SDK clients
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = "Product";

exports.handler = async (event) => {
  try {
    let params = {
      TableName: tableName,
      Limit: event.limit || 10,
      ScanFilter: {
        parentSkuId: {
          ComparisonOperator: "NOT_NULL",
        },
      },
    };

    if (event.lastEvaluatedKey) {
      params.ExclusiveStartKey = event.lastEvaluatedKey;
    }

    if (event.name) {
      params.ScanFilter.name = {
        ComparisonOperator: "BEGINS_WITH",
        AttributeValueList: [
          {
            S: event.name,
          },
        ],
      };
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
