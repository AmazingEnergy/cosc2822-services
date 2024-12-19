const {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
  DeleteItemCommand,
  PutItemCommand,
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

    if (!event.body.name) {
      callback(new Error("[BadRequest] name is missing."));
      return;
    }

    if (!event.body.price || event.body.price <= 0 || isNaN(event.body.price)) {
      callback(new Error("[BadRequest] price is missing or invalid."));
      return;
    }

    if (!event.body.category) {
      callback(new Error("[BadRequest] category is missing"));
      return;
    }

    if (!event.body.type) {
      callback(new Error("[BadRequest] type is missing"));
      return;
    }

    if (
      event.body.specs &&
      (typeof event.body.specs !== "object" ||
        !event.body.specs.layer1Name ||
        !event.body.specs.layer1Value ||
        !event.body.specs.layer2Name ||
        !event.body.specs.layer2Value)
    ) {
      callback(
        new Error(
          "[BadRequest] specs is invalid or missing (layer 1 and layer 2 are required)."
        )
      );
      return;
    }

    if (!event.body.stockCode) {
      callback(new Error("[BadRequest] stockCode is missing"));
      return;
    }

    let productResponse = await client.send(
      new GetItemCommand({
        TableName: productTableName,
        Key: {
          skuId: {
            S: event.skuId,
          },
        },
      })
    );
    productResponse = productResponse.Item;
    if (!productResponse) {
      callback(new Error("[NotFound] Product not found"));
      return;
    }
    const existingStockCode = productResponse.stockCode.S;

    let inventoryResponse = await client.send(
      new GetItemCommand({
        TableName: inventoryTableName,
        Key: {
          stockCode: {
            S: existingStockCode,
          },
        },
      })
    );
    inventoryResponse = inventoryResponse.Item;
    if (
      inventoryResponse.quantity.N > 0 &&
      event.body.stockCode !== existingStockCode
    ) {
      callback(
        new Error(
          "[BadRequest] Cannot update product with existing inventory quantity."
        )
      );
      return;
    }

    let params = {
      TableName: productTableName,
      Key: {
        skuId: {
          S: event.skuId,
        },
      },
      UpdateExpression: `SET 
        #n = :name, 
        #d = :description, 
        #t = :type, 
        category = :category, 
        price = :price, 
        isActive = :isActive, 
        stockCode = :stockCode, 
        imageUrls = :imageUrls, 
        specs = :specs
      `,
      ConditionExpression:
        "attribute_not_exists(stockCode) AND attribute_not_exists(#n)",
      ExpressionAttributeValues: {
        ":name": { S: event.body.name },
        ":description": { S: event.body.description },
        ":type": { S: event.body.type },
        ":category": { S: event.body.category },
        ":price": { N: event.body.price.toString() },
        ":isActive": { BOOL: event.body.isActive },
        ":stockCode": { S: event.body.stockCode },
      },
      ExpressionAttributeNames: {
        "#n": "name",
        "#d": "description",
        "#t": "type",
      },
      ReturnValues: "ALL_NEW",
    };

    if (event.body.imageUrls && event.body.imageUrls.length > 0) {
      params.ExpressionAttributeValues[":imageUrls"] = {
        L: event.body.imageUrls.map((url) => ({ S: url })),
      };
    } else {
      params.ExpressionAttributeValues[":imageUrls"] = { L: [] };
    }

    if (event.body.specs) {
      params.ExpressionAttributeValues[":specs"] = {
        M: {
          layer1Name: { S: event.body.specs.layer1Name },
          layer1Value: { S: event.body.specs.layer1Value },
          layer2Name: { S: event.body.specs.layer2Name },
          layer2Value: { S: event.body.specs.layer2Value },
        },
      };
    } else {
      params.ExpressionAttributeValues[":specs"] = {
        M: {
          layer1Name: { S: "" },
          layer1Value: { S: "" },
          layer2Name: { S: "" },
          layer2Value: { S: "" },
        },
      };
    }

    console.log("Params: ", JSON.stringify(params));

    const command = new UpdateItemCommand(params);
    productResponse = await client.send(command);
    console.log("Updated product data: ", JSON.stringify(productResponse));

    console.log("Deleting inventory data for stockCode: ", existingStockCode);
    await client.send(
      new DeleteItemCommand({
        TableName: inventoryTableName,
        Key: {
          stockCode: {
            S: existingStockCode,
          },
        },
      })
    );

    console.log(
      "Creating inventory data for stockCode: ",
      event.body.stockCode
    );
    inventoryResponse = await client.send(
      new PutItemCommand({
        TableName: inventoryTableName,
        Item: {
          stockCode: {
            S: event.body.stockCode,
          },
          quantity: {
            N: "0",
          },
          isActive: {
            BOOL: true,
          },
        },
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
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
