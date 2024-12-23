const { SFNClient, StartExecutionCommand } = require("@aws-sdk/client-sfn");

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
  // https://docs.aws.amazon.com/lambda/latest/dg/with-sqs.html#example-standard-queue-message-event
  const { body } = record;
  if (!body) return;
  console.log("Message Body: ", body);

  // TODO: start sync step function
}
