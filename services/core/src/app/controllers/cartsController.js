const controller = require("../../utils/controller");
const { extractUserClaims } = require("../../utils/claims");
const dto = require("../dto");
const cartService = require("../services/cartService");

const getCart = controller.get(async (req, res, next) => {
  res.json(
    await cartService.getCart(req.params.id, extractUserClaims(req).userId)
  );
}, dto.FindCartParams);

const postCreateCart = controller.post(async (req, res, next) => {
  res.json(
    await cartService.createCart({
      ...req.body,
      customerId: extractUserClaims(req).userId,
      createdBy: extractUserClaims(req).email,
    })
  );
}, dto.CreateCartDto);

const postAddCartItem = controller.post(
  async (req, res, next) => {
    res.json(
      await cartService.addItem({
        ...req.body,
        cartId: req.params.id,
        customerId: extractUserClaims(req).userId,
        createdBy: extractUserClaims(req).email,
      })
    );
  },
  dto.FindCartParams,
  dto.AddCartItemDto
);

const postRemoveCartItem = controller.post(
  async (req, res, next) => {
    res.json(
      await cartService.removeItem({
        ...req.body,
        cartId: req.params.id,
        customerId: extractUserClaims(req).userId,
        removedBy: extractUserClaims(req).email,
      })
    );
  },
  dto.FindCartParams,
  dto.RemoveCartItemDto
);

const postUpdateCartItem = controller.post(
  async (req, res, next) => {
    res.json(
      await cartService.updateItem({
        ...req.body,
        cartId: req.params.id,
        customerId: extractUserClaims(req).userId,
        updatedBy: extractUserClaims(req).email,
      })
    );
  },
  dto.FindCartParams,
  dto.UpdateCartItemDto
);

const postPayCart = controller.post(
  async (req, res, next) => {
    res.json(
      await cartService.pay({
        ...req.body,
        cartId: req.params.id,
        customerId: extractUserClaims(req).userId,
        paidBy: extractUserClaims(req).email,
      })
    );
  },
  dto.FindCartParams,
  dto.PayCartDto
);

const getCartPayment = controller.get(
  async (req, res, next) => {
    res.json(await cartService.getPayment(req.params.id, req.query.sessionId));
  },
  dto.FindCartParams,
  dto.ListCartPaymentQuery
);

const postSubmitCart = controller.post(
  async (req, res, next) => {
    res.json(
      await cartService.submit({
        ...req.body,
        cartId: req.params.id,
        customerId: extractUserClaims(req).userId,
        submittedBy: extractUserClaims(req).email,
      })
    );
  },
  dto.FindCartParams,
  dto.SubmitCartDto
);

module.exports = {
  getCart,
  postCreateCart,
  postAddCartItem,
  postRemoveCartItem,
  postUpdateCartItem,
  postPayCart,
  getCartPayment,
  postSubmitCart,
};
