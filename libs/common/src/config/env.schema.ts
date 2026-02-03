import * as Joi from 'joi';

export const ENV_SCHEMA = Joi.object({
  PORT_GATEWAY_REST: Joi.number().port().default(3000),
  PORT_AUTH: Joi.number().port().default(3001),
  SWAGGER_ENABLED: Joi.boolean().default(true),
  SWAGGER_PATH: Joi.string().default('swagger'),
} as Joi.SchemaMap);
