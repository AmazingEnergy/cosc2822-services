const fs = require("node:fs");
const path = require("node:path");

const { Umzug, SequelizeStorage, MigrationError } = require("umzug");
const { Sequelize } = require("sequelize");

const { db } = require("./connectors/sequelizeConnector");
const appConfig = require("../app/configs/appConfig");
const rootDir = require("../utils/path");

const infraPath = path.join(rootDir, "infra");
const migrationTemplatePath = path.join(infraPath, "migration-template.js");
const migrationRelativePath = appConfig.migrationsLocation;

const sequelize = db();

/**
 * @see https://github.com/sequelize/umzug/blob/main/src/types.ts
 */
module.exports.migrator = new Umzug({
  migrations: {
    glob: ["migrations/*.{js,up.sql}", { cwd: infraPath }],
    resolve: resolveMigrations,
  },
  context: sequelize,
  storage: new SequelizeStorage({ sequelize, modelName: "migration_meta" }),
  logger: console,
  create: {
    folder: migrationRelativePath,
    template: (filepath) => {
      if (filepath.endsWith(".sql"))
        return [
          // read template from filesystem
          [filepath.replace(".sql", ".up.sql"), ""],
          [filepath.replace(".sql", ".down.sql"), ""],
        ];
      return [
        // read template from filesystem
        [filepath, fs.readFileSync(migrationTemplatePath).toString()],
      ];
    },
  },
});

/**
 * @see https://github.com/sequelize/umzug/tree/main#usage
 */
module.exports.autoMigration = async () => {
  if (!appConfig.autoMigration) return;

  const pendingMigrations = await this.migrator.pending();
  if (pendingMigrations.length === 0) {
    console.log("No pending migrations found.");
    return;
  }
  console.log("Pending migrations: ", pendingMigrations);

  try {
    await this.migrator.up();

    const completedMigrations = await this.migrator.executed();
    console.log("Completed migrations: ", completedMigrations);
  } catch (ex) {
    if (ex instanceof MigrationError) {
      const original = ex.cause;
      console.log("Migration fail: ", original);
      process.exit(-1);
    }
    throw e;
  }
};

function resolveMigrations(params) {
  if (!params.path.endsWith(".sql")) {
    /**
     * @see https://github.com/sequelize/umzug/tree/main#modifying-the-parameters-passed-to-your-migration-methods
     */
    const migration = require(params.path);
    return {
      // adjust the parameters Umzug will
      // pass to migration methods when called
      name: params.name,
      up: async () =>
        migration.up(params.context.getQueryInterface(), Sequelize),
      down: async () =>
        migration.down(params.context.getQueryInterface(), Sequelize),
    };
  }

  /**
   * @see https://github.com/sequelize/umzug/tree/main#additional-migration-configuration-options
   */
  return {
    name: params.name,
    up: async () => {
      const sql = fs.readFileSync(params.path).toString();
      return params.context.query(sql);
    },
    down: async () => {
      // Get the corresponding `.down.sql` file to undo this migration
      const sql = fs
        .readFileSync(params.path.replace(".up.sql", ".down.sql"))
        .toString();
      return params.context.query(sql);
    },
  };
}
