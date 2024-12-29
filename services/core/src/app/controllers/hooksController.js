const controller = require("../../utils/controller");
const cartService = require("../services/cartService");

const postStripeNotifications = controller.post(async (req, res) => {
  try {
    console.log("Webhook data:", req.body.toString());
    console.log("Webhook signature:", req.headers["stripe-signature"]);

    await cartService.paymentNotification(
      req.body.toString(),
      req.headers["stripe-signature"]
    );
    res.status(200).send();
  } catch (err) {
    console.log("Webhook Error:", err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = {
  postStripeNotifications,
};
