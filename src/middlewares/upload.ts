/* eslint-disable indent */
import { NextFunction, Request, Response } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { join } from 'path';
import { MESSAGES, XP } from '../constants';
import { Team, User } from '../models';
import { BadRequest, Logger, teamAvatarSchema, uploadCatcher, validate } from '../modules';

const store = multer({
    limits: {
        fileSize: 512000 // 500 Kb
    },
    fileFilter: uploadCatcher(
        async (req: Request, file: Express.Multer.File, done: FileFilterCallback) => {
            const mimetype = file.mimetype;

            if (mimetype !== 'image/png' && mimetype !== 'image/jpeg') {
                return done(new BadRequest(MESSAGES.UPLOAD.IMAGES_ONLY));
            }

            const { body, params } = await validate<TeamAvatar>(teamAvatarSchema, {
                params: req.params,
                body: req.body
            });

            const { id } = params;
            const { type } = body;

            if (type === 'team') {
                const team = await Team.findOneAndUpdate(
                    { _id: id, owner: req.session.user.id },
                    { hasAvatar: true }
                );

                if (!team) return done(new BadRequest(MESSAGES.TEAM.NOT_OWNER));

                req.team = team;
            } else {
                const user = await User.findOneAndUpdate(
                    { _id: req.session.user.id },
                    { hasAvatar: true }
                );

                if (!user) return done(new BadRequest(MESSAGES.USER.NOT_FOUND));

                req.user = user;
            }

            return done(null, true);
        }
    ),
    storage: multer.diskStorage({
        destination: join(__dirname, '..', '..', 'uploads'),
        filename: (req, __, done) => {
            const id = req.team ? req.team.id : req.session.user.id;

            if (req.user && !req.user.hasAvatar) {
                req.user.claimXP(XP.AVATAR, req.session).catch((err) => {
                    Logger.error('upload:filename', err);
                });
            }

            return done(null, id + '.png');
        }
    })
}).single('avatar');

export const upload = (req: Request, res: Response, next: NextFunction): void => {
    store(req, res, (error?: unknown): void => {
        if (error) {
            if (error instanceof multer.MulterError) {
                Logger.warn('upload', error);

                switch (error.code) {
                    case 'LIMIT_FILE_SIZE':
                        next(new BadRequest(MESSAGES.UPLOAD.LIMIT_SIZE));
                        break;
                    case 'LIMIT_UNEXPECTED_FILE':
                        next(new BadRequest(MESSAGES.UPLOAD.LIMIT_UNEXPECTED));
                        break;
                    default:
                        next(new BadRequest(MESSAGES.UPLOAD.UNKNOWN));
                        break;
                }

                return;
            } else {
                Logger.warn('upload', error);

                return next(error);
            }
        }

        res.json({ message: MESSAGES.UPLOAD.SUCCESS });
    });
};
