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
} as Joi.SchemaMap);
