const controller = require("../../utils/controller");
const cartService = require("../services/cartService");

const postStripeNotifications = controller.post(async (req, res) => {
  try {
    await cartService.paymentNotification(
      req.body,
      req.headers["stripe-signature"]
    );
    res.send();
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = {
  postStripeNotifications,
};
