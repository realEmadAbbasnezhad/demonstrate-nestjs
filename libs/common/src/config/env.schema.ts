import * as Joi from 'joi';

export const ENV_SCHEMA = Joi.object({
  PORT_GATEWAY_REST: Joi.number().port().default(3000),
  PORT_AUTH: Joi.number().port().default(3001),
} as Joi.SchemaMap);
