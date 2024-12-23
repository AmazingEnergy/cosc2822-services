const { SESv2Client, SendEmailCommand } = require("@aws-sdk/client-sesv2");

export const handler = async (event, context) => {
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

async function processMessageAsync(record, context) {
  const { body } = record;
  if (!body) return;
  console.log("Message Body: ", body);

  // TODO: send email notification
}
