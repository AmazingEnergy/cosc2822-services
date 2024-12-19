module.exports = {
  DEV_ENV: "development",
  PROD_ENV: "production",
  SANDBOX_ENV: "sandbox",

  DEFAULT_LOGGING_LEVEL: "dev",
  DEFAULT_PORT: 8080,

  // The path to the folder that contains the core API routes.
  // The path must start with "/core/api".
  API_PATH: "/core/api",

  HIDDEN_ROLE_CLAIM: "table-talk-type",
  ACCOUNT_ID_CLAIM: "table-talk-externalId",
  CLIENT_ID_CLAIM: "table-talk-appId",
  CLIENT_NAME_CLAIM: "table-talk-appName",
};
