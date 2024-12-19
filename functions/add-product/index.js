const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const productTableName = process.env.TABLE_NAME || "ProductV2";
const inventoryTableName = process.env.INVENTORY_TABLE_NAME || "Inventory";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);
  try {
    if (!event.skuId) {
      callback(new Error("[BadRequest] skuId is missing."));
      return;
    }

    if (!event.name) {
      callback(new Error("[BadRequest] name is missing."));
      return;
    }

    if (!event.price || event.price <= 0 || isNaN(event.price)) {
      callback(new Error("[BadRequest] price is missing or invalid."));
      return;
    }

    if (!event.category) {
      callback(new Error("[BadRequest] category is missing"));
      return;
    }

    if (!event.type) {
      callback(new Error("[BadRequest] type is missing"));
      return;
    }

    if (
      event.specs &&
      (typeof event.specs !== "object" ||
        !event.specs.layer1Name ||
        !event.specs.layer1Value ||
        !event.specs.layer2Name ||
        !event.specs.layer2Value)
    ) {
      callback(
        new Error(
          "[BadRequest] specs is invalid or missing (layer 1 and layer 2 are required)."
        )
      );
      return;
    }

    if (!event.stockCode) {
      callback(new Error("[BadRequest] stockCode is missing"));
      return;
    }

    let params = {
      TableName: productTableName,
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
        "attribute_not_exists(skuId) AND attribute_not_exists(stockCode) AND attribute_not_exists(#n)",
      ExpressionAttributeNames: {
        "#n": "name",
      },
      ReturnValues: "ALL_NEW",
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
    let productResponse = await client.send(command);
    console.log("Created product data: ", JSON.stringify(productResponse));

    let inventoryResponse = await client.send(
      PutItemCommand({
        TableName: inventoryTableName,
        Item: {
          stockCode: {
            S: event.stockCode,
          },
          quantity: {
            N: "0",
          },
          isActive: {
            BOOL: true,
          },
        },
        ConditionExpression: "attribute_not_exists(stockCode)",
        ReturnValues: "ALL_NEW",
      })
    );
    console.log("Created inventory data: ", JSON.stringify(inventoryResponse));

    productResponse = await client.send(
      new GetItemCommand({
        TableName: productTableName,
        Key: {
          skuId: {
            S: event.skuId,
          },
        },
      })
    );

    return {
      statusCode: 200,
      body: productResponse.Item,
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
