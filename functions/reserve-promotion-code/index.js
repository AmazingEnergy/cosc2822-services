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
  process.env.INVENTORY_TABLE_NAME || "PromotionCode";

exports.handler = async (event, context) => {
  console.log("Received Event: ", event);

  try {
    const promotionCode = event.promotionCode;
    if (!promotionCode) {
      console.error("Missing promotionCode");
      return;
    }
    console.log(`Reserve promotion code ${promotionCode}`);
  } catch (error) {
    console.error(error);
  }
};
