const controller = require("../../utils/controller");
const { extractUserClaims } = require("../../utils/claims");
const dto = require("../dto");
const profileService = require("../services/profileService");

const getProfile = controller.get(async (req, res, next) => {
  const claims = extractUserClaims(req);
  const profile = await profileService.getProfile(claims.userId);
  res.json({
    ...profile,
    email: claims.email,
  });
});

const postUpdateProfile = controller.post(async (req, res, next) => {
  const claims = extractUserClaims(req);
  const profile = await profileService.updateProfile({
    ...req.body,
    customerId: claims.userId,
    updatedBy: claims.email,
  });
  res.json(profile);
}, dto.UpdateProfileDto);

module.exports = {
  getProfile,
  postUpdateProfile,
};