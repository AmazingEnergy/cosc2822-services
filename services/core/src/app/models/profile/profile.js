class Profile {
  /**
   * @param {string} customerId
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} email
   * @param {string} createdBy
   * @param {Date} createdAt
   * @param {string} updatedBy
   * @param {Date} updatedAt
   */
  constructor(
    customerId,
    firstName,
    lastName,
    email,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt
  ) {
    this.customerId = customerId;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.createdAt = createdAt || null;
    this.createdBy = createdBy;
    this.updatedAt = updatedAt || null;
    this.updatedBy = updatedBy || null;
  }

  static getAttributes = () => Object.keys(new Profile());

  /**
   * @param value
   * @returns
   * @type {(value: string | undefined)
   * 	=> Profile[]>}
   */
  static fromString = (value) => {
    return JSON.parse(value).map(
      (p) =>
        new Profile(
          p.customerId,
          p.firstName,
          p.lastName,
          p.email,
          p.createdBy,
          p.createdAt,
          p.updatedBy,
          p.updatedAt
        )
    );
  };
}

module.exports = Profile;
