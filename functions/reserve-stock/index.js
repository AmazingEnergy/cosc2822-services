const {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "ap-southeast-1",
});

const inventoryTableName = process.env.INVENTORY_TABLE_NAME || "Inventory";

exports.handler = async (event, context) => {
  console.log("Received Event: ", event);

  try {
    if (!event.items) {
      console.error("Missing items");
      return event;
    }

    for (const item of event.items) {
      console.log(
        `Reserve stock for skuId: ${item.skuId} quantity: ${item.quantity}`
      );

      const inventoryResponse = await client.send(
        new GetItemCommand({
          TableName: inventoryTableName,
          Key: {
            stockCode: {
              S: item.stockCode,
            },
          },
        })
      );
      if (!inventoryResponse.Item) {
        // TODO: handle stock reservation fail
        console.error(`Inventory ${item.stockCode} not found`);
        continue;
      }
      const inventory = unmarshall(inventoryResponse.Item);
      if (inventory.quantity < item.quantity) {
        // TODO: handle stock reservation fail
        console.error(`Inventory ${item.stockCode} is not available`);
        continue;
      }

      const updateResponse = await client.send(
        new UpdateItemCommand({
          TableName: inventoryTableName,
          Key: {
            stockCode: {
              S: item.stockCode,
            },
          },
          UpdateExpression: "SET quantity = quantity - :quantity",
          ExpressionAttributeValues: {
            ":quantity": { N: item.quantity.toString() },
          },
          ReturnValues: "ALL_NEW",
        })
      );

      if (updateResponse.Attributes.quantity < 0) {
        // TODO: handle stock reservation fail
        console.error(`Fail to reserve stock for ${item.stockCode}`);
        continue;
      }

      console.log("Updated inventory data: ", JSON.stringify(updateResponse));

      console.log(`Reserved ${item.quantity} items for ${item.stockCode}`);
    }
  } catch (error) {
    console.error(error);
  }

  return event;
};
