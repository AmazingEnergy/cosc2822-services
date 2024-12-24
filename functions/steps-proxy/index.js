const { SFNClient, StartExecutionCommand } = require("@aws-sdk/client-sfn");

const sfnClient = new SFNClient({
  region: process.env.REGION_STR || "ap-southeast-1",
});

exports.handler = async (event, context) => {
  console.log("Received Event: ", event);
  // https://docs.aws.amazon.com/lambda/latest/dg/services-sqs-errorhandling.html
  const batchItemFailures = [];
  for (const record of event.Records) {
    const { messageId } = record;
    console.log("Processing Record: ", messageId);
    try {
      await processMessageAsync(record, context);
    } catch (error) {
      console.error("Error processing record: ", error);
      batchItemFailures.push({ itemIdentifier: messageId });
    }
  }
  return { batchItemFailures };
};

const processMessageAsync = async (record, context) => {
  // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#example-standard-queue-message-event
  const { messageType, data } = readRecord(record);
  if (!messageType || !data) return;
  switch (messageType) {
    case "OrderCreated": {
      console.log(
        `Start handle OrderCreated event of order ${data.orderNumber}`
      );
      const stepFunctionInput = {
        orderNumber: data.orderNumber,
        promotionCode: data.promotionCode,
        items: data.orderItems.map((item) => ({
          skuId: item.skuId,
          stockCode: item.stockCode,
          quantity: item.quantity,
        })),
      };
      const command = new StartExecutionCommand({
        stateMachineArn: process.env.RESERVATION_STEP_FUNCTIONS_ARN,
        input: JSON.stringify(stepFunctionInput),
      });
      const response = await sfnClient.send(command);
      console.log(
        `Successfully start step function, executionArn: ${response.executionArn}`
      );
      break;
    }
    default:
      console.error(`Not handle message type: ${messageType}`);
  }
};

const readRecord = (record) => {
  let { body } = record;
  if (!body) return {};
  console.log("Message Body: ", body);
  body = JSON.parse(body);
  const messageType = body["MessageAttributes"]["messageType"].Value;
  console.log("Message Type: ", messageType);
  const data = JSON.parse(body["Message"]);
  console.log("Message Data: ", data);
  return { messageType, data };
};
