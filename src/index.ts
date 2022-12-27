import 'dotenv/config';
import connectRedis from 'connect-redis';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { join } from 'path';
import { RateLimiterMemory, RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import {
    APP_PORT,
    LIMITER_OPTIONS,
    MONGO_OPTIONS,
    MONGO_URI,
    REDIS_OPTIONS,
    SESSION_OPTIONS
} from './config';
import { MESSAGES } from './constants';
import { active, maintenance, notFound, otherErrors } from './middlewares';
import { Logger, TooManyRequests } from './modules';
import {
    admin,
    avatar,
    email,
    home,
    login,
    logout,
    password,
    register,
    teams,
    tournaments,
    users
} from './routes';

// create the application and set it up
// using redis, store & sessions
const app = express();
const redis = new Redis(REDIS_OPTIONS);
const connectRedisStore = connectRedis(session);

export const store = new connectRedisStore({ client: redis });

const limiter = new RateLimiterRedis({
    ...LIMITER_OPTIONS,
    storeClient: redis,
    insuranceLimiter: new RateLimiterMemory(LIMITER_OPTIONS)
});
const assignDate = (req: Request, _: Response, next: NextFunction) => {
    req.date = Logger.date();
    next();
};

morgan.token('date', (req: Request) => {
    return req.date;
});

// disable express signature
app.disable('x-powered-by');
app.set('trust proxy', 1);

// json parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(assignDate);
app.use(morgan(':date :method :url :status :response-time[0]ms'));

// init redis, store, session
app.use(
    session({
        ...SESSION_OPTIONS,
        store
    })
);

// ratelimit
app.use((req, res, next) => {
    // if we use cloudflare we need to get clients ip from HTTP_CF_CONNECTING_IP header
    const ip = (req.headers.HTTP_CF_CONNECTING_IP as string) ?? req.ip;

    console.log(ip);

    limiter
        .consume(ip)
        .then((data: RateLimiterRes) => {
            res.set({
                'X-RateLimit-Limit': LIMITER_OPTIONS.points,
                'X-RateLimit-Remaining': data.remainingPoints,
                'X-RateLimit-Reset': Date.now() + data.msBeforeNext
            });
            next();
        })
        .catch((data: RateLimiterRes) => {
            const retry_after = (data.msBeforeNext / 1000).toFixed(0);

            res.set('Retry-After', retry_after);
            next(new TooManyRequests(MESSAGES.RATE_LIMITED));
        });
});

// admin route
app.use('/admin', admin);

// maintenance check
app.use(maintenance);

// session absolute timeout + ban check
app.use(active);

// TODO: load routes dynamically (mavis-like)
// load the routes
app.use('/', home);
app.use('/login', login);
app.use('/logout', logout);
app.use('/register', register);
app.use('/email', email);
app.use('/password', password);
app.use('/users', users);
app.use('/teams', teams);
app.use('/tournaments', tournaments);
app.use('/avatar', avatar);

// TODO: move to separate process/server/cdn
app.use('/docs', express.static(join(__dirname, 'docs')));

// TODO: remove later
app.use('/test', express.static(join(__dirname, 'test')));
app.use(
    '/uploads',
    express.static(join(__dirname, '..', 'uploads'), {
        setHeaders: (res) => {
            res.set('content-type', 'image/png');
        }
    })
);

// global error handling
app.use(notFound);
app.use(otherErrors);

// start the app and listen for connections
Logger.debug('app', 'Starting...');
mongoose
    .connect(MONGO_URI, MONGO_OPTIONS)
    .then(() => {
        Logger.success('app', 'Started.');
        app.listen(+APP_PORT, '0.0.0.0');
    })
    .catch((e) => {
        Logger.error('app', e);
    });
