const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

const sesClient = new SESv2Client({
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
    case "OrderCreated":
      console.log(
        `Start handle OrderCreated event of order ${data.orderNumber}`
      );
      await sendOrderConfirmationEmail(data);
      break;
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

const sendOrderConfirmationEmail = async (data) => {
  const { orderNumber, contactEmail } = data;
  const params = {
    Destination: {
      ToAddresses: [contactEmail],
    },
    Content: {
      Simple: {
        Body: {
          Html: {
            Data: `<html>
            <head></head>
            <body>
              <h1>Order Confirmation</h1>
              <p>Thank you for your order. Your order number is ${orderNumber}.</p>
            </body>
            </html>`,
          },
        },
        Subject: {
          Data: "Order Confirmation",
        },
      },
    },
    FromEmailAddress: process.env.FROM_EMAIL || "easyshop.onl@yopmail.com",
  };
  const command = new SendEmailCommand(params);
  await sesClient.send(command);
  console.log("Successfully sent order confirmation email");
};
