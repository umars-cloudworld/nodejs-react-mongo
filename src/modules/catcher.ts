import { NextFunction, Request, RequestHandler, Response } from 'express';
import { FileFilterCallback } from 'multer';

type fileFilterHandler = (
    req: Request,
    file: Express.Multer.File,
    done: FileFilterCallback
) => Promise<void>;

export const catcher =
    (handler: RequestHandler) =>
        (...args: [Request, Response, NextFunction]): void => {
            Promise.resolve()
                .then(() => handler(...args))
                .catch(args[2]);
        };

export const uploadCatcher =
    (handler: fileFilterHandler) =>
        (...args: [Request, Express.Multer.File, FileFilterCallback]): void => {
            Promise.resolve()
                .then(() => handler(...args))
                .catch(args[2]);
        };
