import { SessionOptions } from 'express-session';
import { NODE_ENV } from './app';

const SESSION_MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 1 week

export const SESSION_ABSOLUTE_TIMEOUT = SESSION_MAX_AGE * 4; // 4 weeks

export const {
    SESSION_SECRET = 'secret',
    SESSION_NAME = 'sid'
} = process.env;

export const SESSION_OPTIONS: SessionOptions = {
    name: SESSION_NAME,
    secret: SESSION_SECRET,
    rolling: true,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: SESSION_MAX_AGE,
        secure: NODE_ENV === 'production',
        sameSite: true
    }
};
