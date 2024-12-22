const { Stripe } = require("stripe");
const { getSecretValue } = require("./awsConnector");

/**
 * @type {Stripe}
 */
let stripeClient;

stripeClient = () => {
  if (!stripeClient) {
    const secretKey = getSecretValue(process.env.STRIPE_SECRET_KEY_SECRET_NAME);

    stripeClient = require("stripe")(secretKey, {
      maxNetworkRetries: 2,
      apiVersion: "2022-08-01",
      appInfo: {
        name: "easy-shop/core",
        version: "0.0.1",
        url: "https://github.com/AmazingEnergy/cosc2822-services",
      },
    });
    console.log("Successfully initialize stripeClient.");
  }
  return stripeClient;
};

/**
 *
 * @returns {Promise<{publishableKey: string, prices: Stripe.Price[]}>}
 */
const getPrices = async () => {
  const prices = await stripeClient().prices.list({
    lookup_keys: ["tabletalk_pro"],
    expand: ["data.product"],
  });

  return {
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    prices: prices.data,
  };
};

/**
 *
 * @param {string} priceId
 * @returns {Promise<Stripe.Price>}
 */
const getPriceById = async (priceId) => {
  return await stripeClient().prices.retrieve(priceId);
};

/**
 *
 * @param {string} email
 * @returns {Promise<Stripe.Customer>}
 */
const getCustomer = async (email) => {
  return (
    (
      await stripeClient().customers.search({
        query: `email:'${email}'`,
      })
    ).data[0] || null
  );
};

/**
 * @param {string} name
 * @param {string} email
 * @returns {Promise<Stripe.Customer>}
 */
const createCustomer = async (name, email) => {
  return await stripeClient().customers.create({
    name: name,
    email: email,
  });
};

/**
 * @param {string} paymentIntentId
 * @returns {Promise<Stripe.PaymentIntent>}
 */
const getPaymentIntent = async (paymentIntentId) => {
  return await stripeClient().paymentIntents.retrieve(paymentIntentId);
};

/**
 *
 * @param {object} data
 * @param {string} sig
 * @returns {Stripe.Event}
 */
const extractEvent = (data, sig) => {
  const hookSecret = getSecretValue(
    process.env.STRIPE_WEBHOOK_SECRET_SECRET_NAME
  );
  return stripeClient().webhooks.constructEvent(data, sig, hookSecret);
};

module.exports = {
  getPrices,
  getPriceById,
  getCustomer,
  createCustomer,
  getPaymentIntent,
  extractEvent,
};
