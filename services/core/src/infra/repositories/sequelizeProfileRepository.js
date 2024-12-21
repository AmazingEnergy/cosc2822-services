const models = require("../../app/models");
const dbContext = require("../entities");

/**
 * @param id
 * @returns
 * @type {(id: uuid) => Promise<import("sequelize").Model<any, any>>}
 */
const findById = async (id) => {
  return dbContext.profiles.findByPk(id, {
    attributes: models.Profile.getAttributes(),
  });
};

/**
 * @param profile
 * @returns
 * @type {(profile: import("../../app/models").Profile) => Promise<import("sequelize").Model<any, any>>}
 */
const addProfile = async (profile) => {
  return await dbContext.profiles.create(profile, {
    returning: true,
  });
};

/**
 * @param profile
 * @returns
 * @type {(profile: import("sequelize").Model<any, any>) => Promise<import("sequelize").Model<any, any>>}
 */
const saveProfile = async (profile) => {
  return await profile.save();
};

module.exports = {
  findById,
  addProfile,
  saveProfile,
};
