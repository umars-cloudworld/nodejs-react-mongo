import bcrypt from 'bcrypt';
import { createHmac, timingSafeEqual } from 'crypto';
import { APP_SECRET, BCRYPT_WORK_FACTOR } from '../config';

export const compare = (password: string, hash: string): Promise<boolean> =>
    bcrypt.compare(password, hash);

export const hash = (password: string): Promise<string> =>
    bcrypt.hash(password, BCRYPT_WORK_FACTOR);

export const createState = (data: string): string =>
    createHmac('sha256', APP_SECRET).update(data).digest('hex');

export const isStateValid = (id: string, state: string, exp: string): boolean =>
    timingSafeEqual(Buffer.from(createState(id + exp)), Buffer.from(state)) && +exp > Date.now();
