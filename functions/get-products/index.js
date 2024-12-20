const { DynamoDBClient, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const productTableName = process.env.TABLE_NAME || "ProductV2";
const inventoryTableName = process.env.INVENTORY_TABLE_NAME || "Inventory";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);
  try {
    limit = 10;
    if (event.limit && !isNaN(event.limit)) {
      limit = parseInt(event.limit);
    }

    let params = {
      TableName: productTableName,
      Limit: limit,
      FilterExpression: "attribute_exists(#s) AND #i = :active",
      ExpressionAttributeNames: {
        "#s": "skuId",
        "#i": "isActive",
      },
      ExpressionAttributeValues: {
        ":active": { BOOL: true },
      },
    };

    if (event.lastEvaluatedKey && event.lastEvaluatedKey !== "") {
      params.ExclusiveStartKey = {
        skuId: { S: event.lastEvaluatedKey },
      };
    }

    if (event.name) {
      params.FilterExpression +=
        " AND (begins_with(#name, :prefix) OR contains(#name, :subString))";
      params.ExpressionAttributeNames["#name"] = "lowerCaseName";
      params.ExpressionAttributeValues[":prefix"] = {
        S: event.name.toLowerCase(),
      };
      params.ExpressionAttributeValues[":subString"] = {
        S: event.name.toLowerCase(),
      };
    }

    if (event.category) {
      params.FilterExpression += " AND #category = :category";
      params.ExpressionAttributeNames["#category"] = "category";
      params.ExpressionAttributeValues[":category"] = { S: event.category };
    }

    console.log("Params: ", JSON.stringify(params));

    const productResponse = await client.send(new ScanCommand(params));

    console.log("Scanned product data: ", JSON.stringify(productResponse));

    const products = productResponse.Items.map((item) => unmarshall(item));

    console.log("Unmarshalled product data: ", JSON.stringify(products));

    const stockCodes = products
      .filter((product) => product.stockCode && product.stockCode !== null)
      .map((product) => product.stockCode);

    console.log("Stock Codes: ", JSON.stringify(stockCodes));

    const stockCodesExpression = stockCodes
      .map((_, i) => `:code${i}`)
      .join(", ");

    console.log("Stock Codes Expression: ", stockCodesExpression);

    const stockCodesExpressionValues = stockCodes.reduce(
      (acc, stockCode, i) => ({
        ...acc,
        [`:code${i}`]: { S: stockCode },
      }),
      {}
    );

    console.log("Stock Codes Expression Values: ", stockCodesExpressionValues);

    const inventoryResponse = await client.send(
      new ScanCommand({
        TableName: inventoryTableName,
        FilterExpression: `stockCode IN (${stockCodesExpression})`,
        ExpressionAttributeValues: stockCodesExpressionValues,
      })
    );

    const inventories = inventoryResponse.Items.map((item) => unmarshall(item));

    console.log("Unmarshalled inventory data: ", JSON.stringify(inventories));

    products.forEach((product) => {
      const inventory = inventories.find(
        (inventory) => inventory.stockCode === product.stockCode
      );

      if (inventory) {
        product.inventory = inventory;
      }
    });

    if (productResponse.LastEvaluatedKey) {
      return {
        statusCode: 200,
        body: {
          items: products,
          lastEvaluatedKey: unmarshall(productResponse.LastEvaluatedKey).skuId,
        },
      };
    }

    return { statusCode: 200, body: { items: products } };
  } catch (error) {
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
