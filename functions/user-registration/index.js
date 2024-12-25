const {
  SESv2Client,
  ListEmailIdentitiesCommand,
  CreateEmailIdentityCommand,
} = require("@aws-sdk/client-sesv2");

const sesV2Client = new SESv2Client({
  region: process.env.REGION_STR || "ap-southeast-1",
});

exports.handler = async (event) => {
  console.log("Received Event: ", event);

  const email = event.request.userAttributes.email;

  console.log("New registered user email:", email);

  if (email) {
    try {
      await autoAddSesIdentity(email);
    } catch (error) {
      console.error("Error adding SES Identity: ", error);
    }
  }

  return event;
};

const autoAddSesIdentity = async (email) => {
  // https://docs.aws.amazon.com/ses/latest/DeveloperGuide/verify-email-addresses-procedure.html

  const listIdentitiesResponse = await sesV2Client.send(
    new ListEmailIdentitiesCommand({
      PageSize: Number(process.env.PAGE_SIZE || "1000"),
    })
  );

  const identity = listIdentitiesResponse.EmailIdentities.find(
    (item) =>
      item.IdentityName === email && item.IdentityType === "EMAIL_ADDRESS"
  );

  console.log("Found existing email identity: ", identity);

  if (!identity) {
    const createIdentityResponse = await sesV2Client.send(
      new CreateEmailIdentityCommand({
        EmailIdentity: email,
      })
    );

    console.log("Create Identity Response: ", createIdentityResponse);
  }

  if (identity && identity.VerificationStatus === "SUCCESS") {
    console.log("Email is already verified");
    return;
  }

  console.log("Email is not verified yet");
};
