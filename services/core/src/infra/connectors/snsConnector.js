const { SNSClient, PublishCommand } = require("@aws-sdk/client-sns");
const { getSecretValue } = require("./awsConnector");

/**
 * Publish order event to SNS
 * @param {string} id
 * @param {string} messageType
 * @param {object} message
 */
const publicOrderEvent = async (id, messageType, message) => {
  const topicArn = getSecretValue(process.env.ORDER_SNS_TOPIC_ARN_SECRET_NAME);
  await publishEvent(topicArn, id, messageType, message);
};

/**
 * Publish event to SNS
 * @param {string} topicArn
 * @param {string} id
 * @param {string} messageType
 * @param {object} message
 */
const publishEvent = async (topicArn, id, messageType, message) => {
  try {
    console.log(`Publish event ${messageType} to topic ${topicArn}`);
    const snsClient = new SNSClient({
      region: process.env.REGION_STR,
    });
    const command = new PublishCommand({
      TopicArn: topicArn,
      Message: JSON.stringify(message),
      MessageDeduplicationId: id,
      MessageAttributes: {
        messageType: {
          DataType: "String",
          StringValue: messageType,
        },
      },
    });
    const response = await snsClient.send(command);
    console.log(
      `Successfully publish event to SNS, Id: ${response.MessageId} SequenceNumber: ${response.SequenceNumber}`
    );
  } catch (error) {
    console.error(`Error publishing event to SNS: ${error}`);
    console.log(`Fail to publish event ${messageType} to topic ${topicArn}`);
  }
};

module.exports = {
  publicOrderEvent,
  publishEvent,
};
