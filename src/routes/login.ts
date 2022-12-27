import { Router } from 'express';
import { ACCOUNT_LOCK_DURATION } from '../config';
import { MESSAGES } from '../constants';
import { guest } from '../middlewares';
import { User } from '../models';
import { BadRequest, catcher, logIn, loginSchema, validate } from '../modules';

const login = Router();
// TODO: a scalable solution
const attempts: Map<string, number> = new Map();
const locked: Map<string, number> = new Map();

/**
 * @api {post} /login POST - login
 * @apiVersion 1.0.0
 * @apiName post
 * @apiGroup login
 * @apiPermission guest
 *
 * @apiParam (Body) {String} login user email or username
 * @apiParam (Body) {String} password user password
 * 
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 * 
 *     {
 *       "message": "login_success",
 *     }
 * 
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 * 
 *     {
 *       "message": "validation_[login|password]"
 *     }
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 * 
 *     {
 *       "message": "login_[invalid|locked]"
 *     }
 * 
 * @apiSampleRequest off
 */
login.post('/', guest, catcher(async (req, res) => {

    const { login, password } = await validate<Login>(loginSchema, req.body);
    const user = await User.findOne({ $or: [{ email: login }, { username: login }] });

    if (!user) throw new BadRequest(MESSAGES.LOGIN.INVALID);

    const lockedAccount = locked.get(user.id);

    if (lockedAccount) {
        if (lockedAccount <= Date.now()) {
            // unlock account
            attempts.delete(user.id);
            locked.delete(user.id);
        }

        // TODO: do this in front end instead
        // const date = new Date(lockedAccount).toLocaleDateString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

        throw new BadRequest(MESSAGES.LOGIN.LOCKED, {
            locked_until: lockedAccount.toString()
        });
    }

    if (!await user.compare(password)) {
        const attempt = attempts.get(user.id);

        if (attempt && attempt >= 3) {
            const lockDate = Date.now() + ACCOUNT_LOCK_DURATION;

            // lock account
            locked.set(user.id, lockDate);

            throw new BadRequest(MESSAGES.LOGIN.LOCKED, {
                locked_until: lockDate.toString()
            });
        }

        attempts.set(user.id, attempt ? attempt + 1 : 1);

        throw new BadRequest(MESSAGES.LOGIN.INVALID);
    }

    attempts.delete(user.id);
    logIn(req.session, user);

    res.json({ message: MESSAGES.LOGIN.SUCCESS });
}
));

export {
    login
};
