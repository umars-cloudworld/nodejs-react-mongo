import { Response } from 'express';
import { Session } from 'express-session';
import { SESSION_NAME } from '../config';
import { ROLES } from './roles';

export const isLoggedIn = (session: Session): boolean => !!session.user;

export const isVerified = (session: Session): boolean => !!session.user.verified;

export const isBanned = (session: Session): boolean => !!session.user.banned;

export const isAdmin = (session: Session): boolean => session.user.role === ROLES.ADMINISTRATOR;

export const logIn = (session: Session, user: UserDoc): void => {
    session.user = user;
    session.createdAt = Date.now();
};

export const logOut = (session: Session, res: Response): Promise<void> =>
    new Promise((resolve, reject) => {
        session.destroy((err: Error) => {
            if (err) reject(err);
            res.clearCookie(SESSION_NAME);
            resolve();
        });
    });
