const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

const sesV2Client = new SESv2Client({
  region: process.env.REGION_STR || "ap-southeast-1",
});

const emailFrom = process.env.FROM_EMAIL || "easyshop.onl@yopmail.com";

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
  const { orderNumber, contactEmail, contactName } = data;
  const params = {
    Destination: {
      ToAddresses: [contactEmail],
    },
    Content: {
      Simple: {
        Body: {
          Html: {
            Data: `<html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Thank You for Your Order</title>
              <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f9;
                    color: #333;
                }
                .email-container {
                    max-width: 600px;
                    margin: 20px auto;
                    background: #ffffff;
                    border-radius: 8px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                .header {
                    background-color: #4CAF50;
                    color: white;
                    padding: 20px;
                    text-align: center;
                }
                .content {
                    padding: 20px;
                    text-align: left;
                }
                .content h2 {
                    color: #4CAF50;
                }
                .footer {
                    background-color: #f1f1f1;
                    text-align: center;
                    padding: 10px;
                    font-size: 14px;
                    color: #777;
                }
              </style>
            </head>
            <body>
              <div class="email-container">
                <div class="header">
                  <h1>Thank You for Your Order!</h1>
                </div>
                <div class="content">
                  <p>Hi ${contactName},</p>
                  <p>We have received your order, an order number is: ${orderNumber}.</p>
                  <p>Our team will process your order and update you the status soon.</p>
                  <p><strong>Reminder:</strong> To ensure your order is processed without delays, please complete your online payment.</p>
                  <p>If you’ve already completed your payment, please disregard this message.</p>
                  <p>Thank you for choosing EasyShop! We hope you have a good shopping time on our platform.</p>
                </div>
                 <div class="footer">
                  <p>&copy; 2024-2025 EasyShop. All rights reserved.</p>
                  <p>address: 123 ABC | support.easyshop@yopmail.com</p>
                </div>
              </div>
            </body>
            </html>`,
          },
        },
        Subject: {
          Data: `Order Confirmation: ${orderNumber}`,
        },
      },
    },
    FromEmailAddress: emailFrom,
  };
  const command = new SendEmailCommand(params);
  await sesV2Client.send(command);
  console.log("Successfully sent order confirmation email");
};
