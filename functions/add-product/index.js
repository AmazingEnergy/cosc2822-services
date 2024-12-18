const AWS = require("aws-sdk");

// Initialize AWS SDK clients
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = "Product";

exports.handler = async (event) => {
  console.log("Received Event: ", event);
  try {
    if (!event.skuId) {
      return {
        statusCode: 400,
        body: { error: "[BadRequest] skuId is missing." },
      };
    }

    if (!event.name) {
      return {
        statusCode: 400,
        body: { error: "[BadRequest] name is missing." },
      };
    }

    if (!event.price || event.price <= 0 || isNaN(event.price)) {
      return {
        statusCode: 400,
        body: { error: "[BadRequest] price is invalid or missing." },
      };
    }

    if (!event.category) {
      return {
        statusCode: 400,
        body: { error: "[BadRequest] category is missing." },
      };
    }

    if (!event.type) {
      return {
        statusCode: 400,
        body: { error: "[BadRequest] type is missing." },
      };
    }

    if (
      !event.specs &&
      (typeof event.specs !== "object" ||
        !Object.keys(event.specs).layer1Name ||
        !Object.keys(event.specs).layer1Value ||
        !Object.keys(event.specs).layer2Name ||
        !Object.keys(event.specs).layer2Value)
    ) {
      return {
        statusCode: 400,
        body: {
          error:
            "[BadRequest] specs is invalid or missing (layer 1 and layer 2 are required).",
        },
      };
    }

    if (!event.stockCode) {
      return {
        statusCode: 400,
        body: { error: "[BadRequest] stockCode is missing." },
      };
    }

    let params = {
      TableName: tableName,
      Item: {
        skuId: event.skuId,
        name: event.name,
        price: event.price,
        description: event.description,
        category: event.category,
        type: event.type,
        parentSkuId: event.parentSkuId || null,
        imageUrls: event.imageUrls || [],
        specs: event.specs || {},
        isActive: true,
        stockCode: event.stockCode,
      },
      ConditionExpression:
        "attribute_not_exists(skuId) AND attribute_not_exists(stockCode) AND attribute_not_exists(name)",
    };

    await dynamoDb.put(params).promise();

    return {
      statusCode: 200,
      body: {
        items: data.Items,
        lastEvaluatedKey: data.LastEvaluatedKey,
      },
    };
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      return {
        statusCode: 400,
        body: {
          error: "[BadRequest] skuId, name, or stockCode already exists.",
        },
      };
    }

    console.error(error);
    return {
      statusCode: 500,
      body: { error: "Something went wrong." },
    };
  }
};
