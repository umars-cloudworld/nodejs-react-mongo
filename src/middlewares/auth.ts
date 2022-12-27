import { NextFunction, Request, Response } from 'express';
import { APP, SESSION_ABSOLUTE_TIMEOUT } from '../config';
import { MESSAGES } from '../constants';
import { BadRequest, catcher, Forbidden, isAdmin, isBanned, isLoggedIn, isVerified, logOut, Unauthorized } from '../modules';

export const staff = (req: Request, _: Response, next: NextFunction): void => {
    if (!isAdmin(req.session)) return next(new Forbidden(MESSAGES.NOT_ADMIN));

    next();
};

export const auth = (req: Request, _: Response, next: NextFunction): void => {
    if (!isLoggedIn(req.session)) return next(new Unauthorized(MESSAGES.NOT_LOGGED_IN));
    next();
};

export const guest = (req: Request, _: Response, next: NextFunction): void => {
    if (isLoggedIn(req.session)) {    
        
        return next(new BadRequest(MESSAGES.LOGGED_IN));
    }

    next();
};

export const verified = (req: Request, _: Response, next: NextFunction): void => {
    if (!isVerified(req.session)) return next(new Forbidden(MESSAGES.EMAIL.NOT_VERIFIED));

    next();
};

// TODO: move to own file
export const maintenance = (_: Request, __: Response, next: NextFunction): void => {
    if (APP.MAINTENANCE) return next(new Forbidden(MESSAGES.MAINTENANCE));

    next();
};

export const active = catcher(
    async (req: Request, res: Response, next: NextFunction) => {
        if (!isLoggedIn(req.session)) return next();

        if (isBanned(req.session)) return next(new Forbidden(MESSAGES.USER.BANNED));

        const { createdAt } = req.session;

        if (Date.now() > createdAt + SESSION_ABSOLUTE_TIMEOUT) {
            await logOut(req.session, res);

            return next(new Unauthorized(MESSAGES.SESSION_EXPIRED));
        }

        next();
    }
);
