import * as Joi from 'joi';

export const ENV_SCHEMA = Joi.object({
  PG_AUTH_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  PG_ORDER_URL: Joi.string()
    .uri({ scheme: ['postgres', 'postgresql'] })
    .required(),
  MONGO_URL: Joi.string()
    .uri({ scheme: ['mongodb', 'mongodb+srv'] })
    .required(),
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .required(),
  ES_URL: Joi.string()
    .uri({ scheme: ['http', 'https'] })
    .required(),

  GATEWAY_REST_PORT: Joi.number().port().default(8080),
  ENABLE_SWAGGER: Joi.boolean().default(true),
  SWAGGER_PATH: Joi.string()
    .pattern(/^[a-zA-Z0-9_/-]+$/)
    .default('swagger'),

  ENABLE_GRAPHIQL: Joi.boolean().default(true),
  GRAPHQL_PATH: Joi.string()
    .pattern(/^[a-zA-Z0-9_/-]+$/)
    .default('graphql'),
  GRAPHIQL_GATEWAY_PORT: Joi.number().port().default(8081),

  AUTH_PORT: Joi.number().port().default(3000),
  AUTH_JWT_KEY: Joi.string()
    .pattern(/^[a-f0-9]{16,64}$/i)
    .default('47a8af5125bf6fa3'),

  CATALOG_PORT: Joi.number().port().default(3001),

  ORDER_PORT: Joi.number().port().default(3002),
} as Joi.SchemaMap);
