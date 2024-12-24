const { DynamoDBClient, GetItemCommand } = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const promotionCodeTableName = process.env.TABLE_NAME || "PromotionCodeV2";

exports.handler = async (event, context, callback) => {
  console.log("Received Event: ", event);

  if (!event.items) {
    callback(new Error("[BadRequest] Invalid cart structure."));
    return;
  }

  try {
    if (event.promotionCode) {
      const promotionResponse = await client.send(
        new GetItemCommand({
          TableName: promotionCodeTableName,
          Key: { code: { S: event.promotionCode } },
        })
      );

      if (!promotionResponse.Item) {
        callback(new Error("[BadRequest] Invalid promotion code."));
        return;
      }

      const promotion = unmarshall(promotionResponse.Item);
      promotion.availableFrom = new Date(promotion.availableFrom).getTime();
      promotion.availableTo = new Date(promotion.availableTo).getTime();

      console.log("Found PromotionCode", promotion);

      const nowTimeStamp = new Date().getTime();
      if (
        nowTimeStamp < promotion.availableFrom ||
        nowTimeStamp > promotion.availableTo
      ) {
        callback(new Error("[BadRequest] Promotion code is not available."));
        return;
      }

      if (promotion.quantity > 0) {
        const discount = promotion.discount || 0;
        for (let item of event.items) {
          item.discountPrice = item.productPrice * (1 - discount);
        }
      } else {
        console.log("Promotion code is out of stock.");
      }
    }

    // TODO: apply promotion rules

    return event;
  } catch (error) {
    console.error(error);
    callback(new Error("[InternalServerError] Something went wrong."));
  }
};
