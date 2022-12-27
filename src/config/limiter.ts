import { IRateLimiterOptions } from 'rate-limiter-flexible';

const {
    LIMITER_POINTS = '100',
    LIMITER_DURATION = '10',
    LIMITER_BLOCK_DURATION = '10'
} = process.env;

export const LIMITER_OPTIONS: IRateLimiterOptions = {
    points: +LIMITER_POINTS,
    duration: +LIMITER_DURATION,
    blockDuration: +LIMITER_BLOCK_DURATION,
    execEvenly: false,
    keyPrefix: 'limiter'
};
