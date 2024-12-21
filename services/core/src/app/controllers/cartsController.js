const controller = require("../../utils/controller");
const { extractUserClaims } = require("../../utils/claims");
const dto = require("../dto");

const getCart = controller.get(async (req, res, next) => {
  // TODO: implement
}, dto.FindCartParams);

const postCreateCart = controller.post(async (req, res, next) => {
  res.json({ message: "Cart created" });
}, dto.CreateCartDto);

const postAddCartItem = controller.post(
  async (req, res, next) => {
    // TODO: implement
  },
  dto.FindCartParams,
  dto.AddCartItemDto
);

const postRemoveCartItem = controller.post(
  async (req, res, next) => {
    // TODO: implement
  },
  dto.FindCartParams,
  dto.RemoveCartItemDto
);

const postUpdateCartItem = controller.post(
  async (req, res, next) => {
    // TODO: implement
  },
  dto.FindCartParams,
  dto.UpdateCartItemDto
);

const postPayCart = controller.post(
  async (req, res, next) => {
    // TODO: implement
  },
  dto.FindCartParams,
  dto.PayCartDto
);

const postSubmitCart = controller.post(
  async (req, res, next) => {
    // TODO: implement
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
  postSubmitCart,
};
