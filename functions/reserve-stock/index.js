const {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const inventoryTableName = process.env.INVENTORY_TABLE_NAME || "Inventory";

exports.handler = async (event, context) => {
  console.log("Received Event: ", event);

  try {
    for (const item of event.items) {
      console.log(
        `Reserve stock for skuId: ${item.skuId} quantity: ${item.quantity}`
      );
    }
  } catch (error) {
    console.error(error);
  }
};
