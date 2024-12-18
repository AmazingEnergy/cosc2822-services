const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const tableName = process.env.TABLE_NAME || "ProductV2";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);
  try {
    if (!event.skuId) {
      callback(new Error("[BadRequest] skuId is missing."));
    }

    if (!event.name) {
      callback(new Error("[BadRequest] name is missing."));
    }

    if (!event.price || event.price <= 0 || isNaN(event.price)) {
      callback(new Error("[BadRequest] price is missing or invalid."));
    }

    if (!event.category) {
      callback(new Error("[BadRequest] category is missing"));
    }

    if (!event.type) {
      callback(new Error("[BadRequest] type is missing"));
    }

    if (
      !event.specs &&
      (typeof event.specs !== "object" ||
        !Object.keys(event.specs).layer1Name ||
        !Object.keys(event.specs).layer1Value ||
        !Object.keys(event.specs).layer2Name ||
        !Object.keys(event.specs).layer2Value)
    ) {
      callback(
        new Error(
          "[BadRequest] specs is invalid or missing (layer 1 and layer 2 are required)."
        )
      );
    }

    if (!event.stockCode) {
      callback(new Error("[BadRequest] stockCode is missing"));
    }

    let params = {
      TableName: tableName,
      Item: {
        skuId: {
          S: event.skuId,
        },
        name: {
          S: event.name,
        },
        price: {
          N: event.price.toString(),
        },
        description: {
          S: event.description || "",
        },
        category: {
          S: event.category,
        },
        type: {
          S: event.type,
        },
        isActive: {
          BOOL: true,
        },
        stockCode: {
          S: event.stockCode,
        },
      },
      ConditionExpression:
        "attribute_not_exists(skuId) AND attribute_not_exists(stockCode) AND attribute_not_exists(name)",
    };

    if (event.parentSkuId) {
      params.Item.parentSkuId = {
        S: event.parentSkuId,
      };
    }

    if (event.imageUrls && event.imageUrls.length > 0) {
      params.Item.imageUrls = {
        L: event.imageUrls.map((url) => ({ S: url })),
      };
    } else {
      params.Item.imageUrls = {
        L: [],
      };
    }

    if (event.specs) {
      params.Item.specs = {
        M: {
          layer1Name: { S: event.specs.layer1Name },
          layer1Value: { S: event.specs.layer1Value },
          layer2Name: { S: event.specs.layer2Name },
          layer2Value: { S: event.specs.layer2Value },
        },
      };
    } else {
      params.Item.specs = {
        M: {
          layer1Name: { S: "" },
          layer1Value: { S: "" },
          layer2Name: { S: "" },
          layer2Value: { S: "" },
        },
      };
    }

    console.log("Params: ", JSON.stringify(params));

    const command = new PutItemCommand(params);
    const data = await client.send(command);

    return {
      statusCode: 200,
      body: data.Item,
    };
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      callback(
        new Error("[BadRequest] skuId, name, or stockCode already exists.")
      );
    }

    console.error(error);

    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
