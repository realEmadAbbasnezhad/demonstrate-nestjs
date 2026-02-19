import * as Joi from 'joi';

export const ENV_SCHEMA = Joi.object({
  PORT_GATEWAY_REST: Joi.number().port().default(3000),
  PORT_AUTH: Joi.number().port().default(3001),
  SWAGGER_ENABLED: Joi.boolean().default(true),
  SWAGGER_PATH: Joi.string().default('swagger'),
  AUTH_JWT_KEY: Joi.string().default('47a8af5125bf6fa3'),
  PG_URL: Joi.string().required(),
  PORT_CATALOG: Joi.number().port().default(3002),
  MONGO_URL: Joi.string().required(),
  REDIS_URL: Joi.string().default('redis://user:password@localhost:6379/0'),
  ES_URL: Joi.string().default('http://localhost:9200'),
  PORT_ORDER: Joi.number().port().default(3003),

  ENABLE_GRAPHIQL: Joi.boolean().default(true),
  GRAPHIQL_PATH: Joi.string()
    .pattern(/^[a-zA-Z0-9_/-]+$/)
    .default('graphql'),
  GRAPHIQL_GATEWAY_PORT: Joi.number().port().default(8081),
} as Joi.SchemaMap);
