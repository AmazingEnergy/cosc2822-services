require("dotenv").config({ path: `.env.${process.env.NODE_ENV}` });
const { loadSecrets } = require("./infra/connectors/awsConnector");

loadSecrets().then(() => {
  /**
   * @see https://github.com/sequelize/umzug/tree/main#cli
   */
  require("./infra/umzug").migrator.runAsCLI();
});
