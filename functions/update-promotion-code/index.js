const {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
  DeleteItemCommand,
  PutItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const promotionCodeTableName =
  process.env.INVENTORY_TABLE_NAME || "PromotionCodeV2";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);

  try {
    if (!event.code) {
      callback(new Error("[BadRequest] code is missing."));
      return;
    }

    if (!event.body.name) {
      callback(new Error("[BadRequest] name is missing."));
      return;
    }

    if (
      !event.body.discount ||
      event.body.discount <= 0 ||
      isNaN(event.body.discount)
    ) {
      callback(new Error("[BadRequest] discount is missing or invalid."));
      return;
    }

    if (event.body.discount > 1) {
      callback(
        new Error("[BadRequest] discount should be less than 1 (e.g. 0.05).")
      );
      return;
    }

    if (
      !event.body.quantity ||
      event.body.quantity <= 0 ||
      isNaN(event.body.quantity)
    ) {
      callback(new Error("[BadRequest] quantity is missing or invalid."));
      return;
    }

    if (!event.body.availableFrom) {
      callback(new Error("[BadRequest] availableFrom is missing"));
      return;
    }

    if (!event.body.availableTo) {
      callback(new Error("[BadRequest] availableTo is missing"));
      return;
    }

    let params = {
      TableName: promotionCodeTableName,
      Key: {
        code: {
          S: event.code,
        },
      },
      UpdateExpression: `SET 
        #n = :name,
        #q = :quantity,
        discount = :discount,
        availableFrom = :availableFrom,
        availableTo = :availableTo
      `,
      ExpressionAttributeValues: {
        ":name": { S: event.body.name },
        ":quantity": { N: event.body.quantity.toString() },
        ":discount": { N: event.body.discount.toString() },
        ":availableFrom": {
          N: new Date(event.body.availableFrom).getTime().toString(),
        },
        ":availableTo": {
          N: new Date(event.body.availableTo).getTime().toString(),
        },
      },
      ExpressionAttributeNames: {
        "#n": "name",
        "#q": "quantity",
      },
      ReturnValues: "ALL_NEW",
    };

    console.log("Params: ", JSON.stringify(params));

    let promotionCodeResponse = await client.send(
      new UpdateItemCommand(params)
    );

    console.log(
      "Updated promotion code data: ",
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
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
