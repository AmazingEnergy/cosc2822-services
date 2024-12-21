const models = require("../models");
const profileRepository = require("../../infra/repositories/sequelizeProfileRepository");

const getProfile = async (customerId) => {
  let profile = await profileRepository.findById(customerId);
  if (!profile) {
    return {
      customerId: customerId,
      firstName: "",
      lastName: "",
      email: "",
    };
  }
  return profile.dataValues;
};

const updateProfile = async (updateProfileDto) => {
  let profile = await profileRepository.findById(updateProfileDto.customerId);
  if (!profile) {
    profile = await profileRepository.addProfile(
      new models.Profile(
        updateProfileDto.customerId,
        updateProfileDto.firstName,
        updateProfileDto.lastName,
        updateProfileDto.email,
        updateProfileDto.updatedBy
      )
    );
    return profile.dataValues;
  }
  profile.firstName = updateProfileDto.firstName;
  profile.lastName = updateProfileDto.lastName;
  profile.email = updateProfileDto.email;
  profile.updatedBy = updateProfileDto.updatedBy;
  await profileRepository.saveProfile(profile);
  return profile.dataValues;
};

module.exports = {
  getProfile,
  updateProfile,
};
