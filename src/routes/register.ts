import { Router } from 'express';
import { MESSAGES } from '../constants';
import { guest } from '../middlewares';
import { User } from '../models';
import {
    BadRequest,
    catcher,
    logIn,
    registerSchema,
    ROLES,
    sendVerificationMail,
    validate
} from '../modules';

const register = Router();

/**
 * @api {post} /register POST - registration
 * @apiVersion 1.0.0
 * @apiName post
 * @apiGroup register
 * @apiPermission guest
 *
 * @apiParam (Body) {String} email user email
 * @apiParam (Body) {String} username user username - regex: (/^[\w]+$/)
 * @apiParam (Body) {String[]} games list of games
 * @apiUse userPasswordAndConfirmation
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "message": "register_success",
 *     }
 *
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "validation_[email|username|password|passwordConfirmation|games]"
 *     }
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "register_invalid"
 *     }
 *
 * @apiSampleRequest off
 */
register.post(
    '/',
    guest,
    catcher(async (req, res) => {
        const { email, username, password, games } = await validate<Register>(
            registerSchema,
            req.body
        );
        const { username: displayName } = req.body;

        if (await User.exists({ $or: [{ email }, { username }] }))
            throw new BadRequest(MESSAGES.REGISTER.INVALID);

        const user = await User.create<Partial<UserDoc>>({
            email,
            username,
            displayName,
            password,
            role: ROLES.MEMBER,
            xp: 0,
            games
        });
        const link = user.getVerificationLink();

        sendVerificationMail(email, link);
        logIn(req.session, user);

        res.json({ message: MESSAGES.REGISTER.SUCCESS, url: link });
    })
);

export { register };
