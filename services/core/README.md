# s3951127-cognito-demo

Simple webapp integrate with RDS database instance (COSC2825 / Task F)

## Development

run nodejs directly

```bash
# run server in development env
npm run macStart

# run server in production env
npm run macStart:prod
```

run nodejs forever on remote server

```bash
# run server in development env
npm run forever

# run server in production env
npm run forever:prod
```

## Migration

```bash
# generate javascript migration
export NODE_ENV=development; npm run generate-migration {{filename.js}}

# generate sql migration
export NODE_ENV=development; npm run generate-migration {{filename.sql}}
```

Looking for generated migrations in [migrations](./src/infra/migrations/) director.

When server starting up, it trigger auto migration if environment variant APP_AUTO_MIGRATION is set to true.

If you want to revert migrations, run following commands:

```bash
# revert specified migration
export NODE_ENV=development; npm run revert-migration {{migration name}}

# revert up to specify migration, including that one
export NODE_ENV=development; npm run revert-migration-to {{migration name}}
```
