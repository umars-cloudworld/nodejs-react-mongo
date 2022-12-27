import { NextFunction, Request, Response } from 'express';
import { MESSAGES } from '../constants';
import { HttpError, Logger } from '../modules';

export const notFound = (_: Request, res: Response): void => {
    res.status(404).json({ message: MESSAGES.NOT_FOUND });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const otherErrors = (err: HttpError, _: Request, res: Response, __: NextFunction): void => {

    if (!err.status) {
        Logger.error('server', err);
        res.status(500).json({ message: MESSAGES.SERVER_ERROR });

        return;
    }

    res.status(err.status);

    if (err.data) {
        res.json({ message: err.message, data: err.data });

        return;
    }

    res.json({ message: err.message });
};
