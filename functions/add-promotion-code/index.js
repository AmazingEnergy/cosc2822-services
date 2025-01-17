const {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const promotionCodeTableName = process.env.TABLE_NAME || "PromotionCodeV2";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);
  try {
    if (!event.name) {
      callback(new Error("[BadRequest] name is missing."));
      return;
    }

    if (!event.code) {
      callback(new Error("[BadRequest] code is missing."));
      return;
    }

    if (!event.discount || event.discount <= 0 || isNaN(event.discount)) {
      callback(new Error("[BadRequest] discount is missing or invalid."));
      return;
    }

    if (event.discount > 1) {
      callback(
        new Error("[BadRequest] discount should be less than 1 (e.g. 0.05).")
      );
      return;
    }

    if (!event.quantity || event.quantity <= 0 || isNaN(event.quantity)) {
      callback(new Error("[BadRequest] quantity is missing or invalid."));
      return;
    }

    if (!event.availableFrom) {
      callback(new Error("[BadRequest] availableFrom is missing"));
      return;
    }

    if (!event.availableTo) {
      callback(new Error("[BadRequest] availableTo is missing"));
      return;
    }

    let params = {
      TableName: promotionCodeTableName,
      Item: {
        name: {
          S: event.name,
        },
        code: {
          S: event.code,
        },
        quantity: {
          N: event.quantity.toString(),
        },
        discount: {
          N: event.discount.toString(),
        },
        availableFrom: {
          N: new Date(event.availableFrom).getTime().toString(),
        },
        availableTo: {
          N: new Date(event.availableTo).getTime().toString(),
        },
      },
      ConditionExpression:
        "attribute_not_exists(code) AND attribute_not_exists(#n)",
      ExpressionAttributeNames: {
        "#n": "name",
      },
      ReturnValues: "NONE",
    };

    console.log("Params: ", JSON.stringify(params));

    const command = new PutItemCommand(params);
    let promotionCodeResponse = await client.send(command);
    console.log(
      "Created promotion code data: ",
      JSON.stringify(promotionCodeResponse)
    );

    promotionCodeResponse = await client.send(
      new GetItemCommand({
        TableName: promotionCodeTableName,
        Key: {
          code: {
            S: event.code,
          },
        },
      })
    );

    const promotionCode = unmarshall(promotionCodeResponse.Item);
    promotionCode.availableFrom = new Date(
      promotionCode.availableFrom
    ).toISOString();
    promotionCode.availableTo = new Date(
      promotionCode.availableTo
    ).toISOString();

    return {
      statusCode: 200,
      body: promotionCode,
    };
  } catch (error) {
    if (error.code === "ConditionalCheckFailedException") {
      callback(new Error("[BadRequest] code or name already exists."));
    }

    console.error(error);

    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
