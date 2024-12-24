const {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const promotionCodeTableName =
  process.env.INVENTORY_TABLE_NAME || "PromotionCodeV2";

exports.handler = async (event, context) => {
  console.log("Received Event: ", event);

  try {
    const promotionCode = event.promotionCode;
    if (!promotionCode) {
      console.error("Missing promotionCode");
      return { status: "skipped" };
    }
    console.log(`Reserve promotion code ${promotionCode}`);

    const promotionCodeResponse = await client.send(
      new GetItemCommand({
        TableName: promotionCodeTableName,
        Key: {
          code: {
            S: promotionCode,
          },
        },
      })
    );

    if (!promotionCodeResponse.Item) {
      // TODO: handle promotion code reservation fail
      console.error(`PromotionCode ${promotionCode} not found`);
      return { status: "failed" };
    }

    const promotion = unmarshall(promotionCodeResponse.Item);

    if (
      !promotion.quantity ||
      promotion.quantity < 1 ||
      (promotion.availableFrom &&
        promotion.availableFrom > new Date().toISOString()) ||
      (promotion.availableTo &&
        promotion.availableTo < new Date().toISOString())
    ) {
      // TODO: handle promotion code reservation fail
      console.error(
        `PromotionCode ${promotionCode} is not available. Quantity: ${promotion.quantity}, AvailableFrom: ${promotion.availableFrom}, AvailableTo: ${promotion.availableTo}`
      );
      return { status: "failed" };
    }

    const updateResponse = await client.send(
      new UpdateItemCommand({
        TableName: promotionCodeTableName,
        Key: {
          code: {
            S: promotionCode,
          },
        },
        UpdateExpression: "SET quantity = quantity - :quantity",
        ExpressionAttributeValues: {
          ":quantity": { N: "1" },
        },
        ReturnValues: "ALL_NEW",
      })
    );

    if (updateResponse.Attributes.quantity < 0) {
      // TODO: handle promotion code reservation fail
      console.error(`Fail to reserve promotion code ${item.stockCode}`);
      return { status: "failed" };
    }

    console.log(
      "Updated promotion code data: ",
      JSON.stringify(updateResponse)
    );

    console.log(`Reserved 1 promotion code for ${promotionCode}`);

    return { status: "success" };
  } catch (error) {
    console.error(error);
    return { status: "failed" };
  }
};
