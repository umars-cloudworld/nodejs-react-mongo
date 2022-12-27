import Joi, {
    ArraySchema,
    BooleanSchema,
    DateSchema,
    NumberSchema,
    Schema,
    StringSchema
} from 'joi';
import { BadRequest } from '.';
import {
    BCRYPT_MAX_BYTES,
    EMAIL_MAX,
    EMAIL_MIN,
    STATE_BYTES,
    USERNAME_MAX,
    USERNAME_MIN
} from '../config';

// Main validation function
export async function validateAsync<T>(schema: Schema, payload: unknown): Promise<T> {
    try {
        return await schema.validateAsync(payload);
    } catch (err) {
        throw new BadRequest((err as Error).message);
    }
}

export function id(message: string): StringSchema {
    return Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .error(new Error(message));
}

export function login(message: string): StringSchema {
    return Joi.string()
        .lowercase()
        .trim()
        .min(USERNAME_MIN)
        .max(EMAIL_MAX)
        .required()
        .error(new Error(message));
}

export function username(message: string): StringSchema {
    return Joi.string()
        .lowercase()
        .trim()
        .min(USERNAME_MIN)
        .max(USERNAME_MAX)
        .regex(/^[\w]+$/)
        .required()
        .error(new Error(message));
}

export function email(message: string): StringSchema {
    return Joi.string()
        .lowercase()
        .trim()
        .min(EMAIL_MIN)
        .max(EMAIL_MAX)
        .email()
        .required()
        .error(new Error(message));
}

export function password(message: string): StringSchema {
    return Joi.string()
        .min(6)
        .max(BCRYPT_MAX_BYTES, 'utf8')
        .regex(/^(?=.*?[\p{Lu}])(?=.*?[\p{Ll}])(?=.*?\d).*$/u)
        .required()
        .error(new Error(message));
}

export function validatedString(target: Array<string>, message: string): StringSchema {
    return Joi.string()
        .valid(...target)
        .required()
        .error(new Error(message));
}

export function ArrayOfValidatedStrings(target: Array<string>, message: string): ArraySchema {
    return Joi.array().items(validatedString(target, message)).required().error(new Error(message));
}

export function confirmation(target: string, message: string): StringSchema {
    return Joi.string().valid(Joi.ref(target)).required().error(new Error(message));
}

export function expiration(message: string): NumberSchema {
    return Joi.number().required().error(new Error(message));
}

export function state(message: string): StringSchema {
    return Joi.string().length(STATE_BYTES).required().error(new Error(message));
}

export function participants(message: string): ArraySchema {
    return Joi.array().items(id(message)).required().error(new Error(message));
}

export function title(message: string, min?: number, max?: number): StringSchema {
    return Joi.string()
        .min(min ?? 5)
        .max(max ?? 128)
        .trim()
        .required()
        .error(new Error(message));
}

export function positiveNumber(message: string): NumberSchema {
    return Joi.number().min(1).required().error(new Error(message));
}

export function yesOrNo(message: string): BooleanSchema {
    return Joi.boolean().required().error(new Error(message));
}

export function date(message: string): DateSchema {
    return Joi.date().error(new Error(message));
}

export function url(scheme: string | string[], message: string): StringSchema {
    return Joi.string().uri({ scheme }).error(new Error(message));
}
