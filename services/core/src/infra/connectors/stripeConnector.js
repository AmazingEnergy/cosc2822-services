const { Stripe } = require("stripe");
const { getSecretValue } = require("./awsConnector");

/**
 * @type {Stripe}
 */
let _stripeClient;

const stripeClient = () => {
  if (!_stripeClient) {
    const secretKey = getSecretValue(process.env.STRIPE_SECRET_KEY_SECRET_NAME);

    _stripeClient = require("stripe")(secretKey, {
      maxNetworkRetries: 2,
      apiVersion: "2022-08-01",
      appInfo: {
        name: "easy-shop/core",
        version: "0.0.1",
        url: "https://github.com/AmazingEnergy/cosc2822-services",
      },
    });
    console.log("Successfully initialize stripeClient().");
  }
  return _stripeClient;
};

const getSession = async (sessionId) => {
  return await stripeClient().checkout.sessions.retrieve(sessionId);
};

const createSession = async (cart, returnUrl) => {
  const lineItems = [];
  for (let item of cart.cartItems) {
    const product = await createProduct(
      item.productName,
      item.discountPrice ? item.discountPrice : item.productPrice
    );
    lineItems.push({
      price: product.priceId,
      quantity: item.quantity,
    });
  }
  const request = {
    ui_mode: "embedded",
    line_items: lineItems,
    mode: "payment",
    metadata: {
      cartId: cart.id,
    },
    redirect_on_completion: "never",
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
  };
  if (returnUrl) {
    request["return_url"] = `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`;
  }

  const session = await stripeClient().checkout.sessions.create(request);
  return session;
};

/**
 * @param {string} name
 * @param {number} productPrice
 * @param {array} imageUrls
 * @returns {Promise<Stripe.Product>}
 */
const createProduct = async (name, productPrice, imageUrls) => {
  // https://docs.stripe.com/products-prices/how-products-and-prices-work
  const priceInCent = parseFloat(productPrice) * 100;

  const product = await stripeClient().products.create({
    name: name,
    images: imageUrls || [],
  });
  const price = await stripeClient().prices.create({
    product: product.id,
    currency: "usd",
    unit_amount: priceInCent,
    // unit_amount_decimal: priceInCent.toString(),
    billing_scheme: "per_unit",
  });
  return {
    productId: product.id,
    priceId: price.id,
  };
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
  getSession,
  createSession,
  createProduct,
  getCustomer,
  createCustomer,
  extractEvent,
};
