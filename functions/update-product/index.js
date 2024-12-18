const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");

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

    if (!event.body.name) {
      callback(new Error("[BadRequest] name is missing."));
    }

    if (!event.body.price || event.body.price <= 0 || isNaN(event.body.price)) {
      callback(new Error("[BadRequest] price is missing or invalid."));
    }

    if (!event.body.category) {
      callback(new Error("[BadRequest] category is missing"));
    }

    if (!event.body.type) {
      callback(new Error("[BadRequest] type is missing"));
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
    }

    if (!event.body.stockCode) {
      callback(new Error("[BadRequest] stockCode is missing"));
    }

    let params = {
      TableName: tableName,
      Key: {
        skuId: {
          S: event.skuId,
        },
      },
      UpdateExpression: `
        SET
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

    const command = new GetItemCommand(params);
    const data = await client.send(command);

    if (!data.Item) {
      callback(new Error("[NotFound] Product not found"));
    }

    return {
      statusCode: 200,
      body: data.Item,
    };
  } catch (error) {
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
