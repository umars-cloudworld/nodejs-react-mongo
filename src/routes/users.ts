import { Router } from 'express';
import { MESSAGES, XP } from '../constants';
import { auth } from '../middlewares';
import { Team, User } from '../models';
import {
    BadRequest,
    catcher,
    editUserPasswordSchema,
    editUserSettingsSchema,
    idSchema,
    logOut,
    validate
} from '../modules';

const users = Router();

/**
 * @api {get} /users GET - all users
 * @apiVersion 1.0.0
 * @apiName get
 * @apiGroup users
 * @apiPermission any
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *     {
 *         "data": [
 *             {
 *             }
 *         ]
 *     }
 *
 * @apiSampleRequest off
 */
users.get(
    '/',
    catcher(async (_, res) => {
        const users: Array<UserDoc> = await User.find();

        res.json({ data: users });
    })
);

/**
 * @api {get} /users/:id GET - user
 * @apiVersion 1.0.0
 * @apiName get-id
 * @apiGroup users
 * @apiPermission any
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "data": {
 *         "games": [
 *           "league_of_legends"
 *         ],
 *         "_id": "6011ad2018ed0fc232b189d5",
 *         "email": "contact@zeref.dev",
 *         "username": "Zeref",
 *         "roles": 1,
 *         "createdAt": "2022-10-12T18:12:48.757Z",
 *         "updatedAt": "2022-10-12T18:15:19.951Z"
 *       }
 *     }
 *
 * @apiSampleRequest off
 */
users.get(
    '/:id',
    catcher(async (req, res) => {
        const { id } = await validate<Id>(idSchema, req.params);
        const user = await User.findById(id);

        res.json({ data: user });
    })
);

/**
 * @api {get} /users/:id GET - user
 * @apiVersion 1.0.0
 * @apiName get-id
 * @apiGroup users
 * @apiPermission any
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "data": {
 *         "games": [
 *           "league_of_legends"
 *         ],
 *         "_id": "6011ad2018ed0fc232b189d5",
 *         "email": "contact@zeref.dev",
 *         "username": "Zeref",
 *         "roles": 1,
 *         "createdAt": "2022-10-12T18:12:48.757Z",
 *         "updatedAt": "2022-10-12T18:15:19.951Z"
 *       }
 *     }
 *
 * @apiSampleRequest off
 */
users.patch(
    '/daily',
    catcher(async (req, res) => {
        const { user } = req.session;
        const now = Date.now();

        if (now < user.dailyXP + 86400000) throw new BadRequest(MESSAGES.USER.XP_FAIL);

        const dbUser = await User.findById(req.session.user.id);

        if (!dbUser) throw new BadRequest(MESSAGES.USER.NOT_FOUND);

        dbUser.claimXP(XP.DAILY, req.session);

        res.json({ message: MESSAGES.USER.XP_SUCCESS });
    })
);

/**
 * @api {patch} /users/settings PATCH - edit user settings
 * @apiVersion 1.0.0
 * @apiName patch-settings
 * @apiGroup users
 * @apiPermission auth
 *
 * @apiParam (Body) {String} email user email
 * @apiParam (Body) {String} username user username
 * @apiParam (Body) {String[]} games list of games
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *         "data": {
 *         }
 *     }
 *
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "validation_[email|username|games]"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "user_[not_found|edit_fail]"
 *     }
 *
 * @apiSampleRequest off
 */
users.patch(
    '/settings',
    auth,
    catcher(async (req, res) => {
        // TODO: fix this endpoint
        const { email, username, games } = await validate<EditUserSettings>(
            editUserSettingsSchema,
            req.body
        );
        const { username: displayName } = req.body;

        if (email !== req.session.user.email) {
            if (await User.exists({ email })) throw new BadRequest(MESSAGES.USER.EDIT_FAIL);
        }

        if (username !== req.session.user.username) {
            if (await User.exists({ username })) throw new BadRequest(MESSAGES.USER.EDIT_FAIL);
        }

        const user = await User.findOneAndUpdate(
            { _id: req.session.user.id },
            { email, username, displayName, games },
            { new: true }
        );

        // TODO: investigate this use case. This might NEVER happen
        if (!user) throw new BadRequest(MESSAGES.USER.NOT_FOUND);

        req.session.user = user;

        res.json({ data: user });
    })
);

/**
 * @api {patch} /users/password PATCH - change user password
 * @apiVersion 1.0.0
 * @apiName patch-password
 * @apiGroup users
 * @apiPermission auth
 *
 * @apiParam {String} currentPassword user current password
 * @apiUse userPasswordAndConfirmation
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "message": user_password_success
 *     }
 *
 *
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "validation_[currentPassword|password|passwordConfirmation]"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "user_[not_owner|not_found|password_wrong]"
 *     }
 *
 * @apiSampleRequest off
 */
users.patch(
    '/password',
    auth,
    catcher(async (req, res) => {
        const { currentPassword, password } = await validate<EditUserPassword>(
            editUserPasswordSchema,
            req.body
        );
        const user = await User.findById(req.session.user.id);

        // TODO: This should never happen
        if (!user) throw new BadRequest(MESSAGES.USER.NOT_FOUND);

        if (!(await user.compare(currentPassword))) {
            return res.json({ message: MESSAGES.USER.PASSWORD_WRONG });
        }

        user.password = password;
        await user.save();

        res.json({ message: MESSAGES.USER.PASSWORD_SUCCESS });
    })
);

/**
 * @api {delete} /users DELETE - user
 * @apiVersion 1.0.0
 * @apiName delete
 * @apiGroup users
 * @apiPermission auth
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "message": "user_delete_success",
 *     }
 *
 * @apiSampleRequest off
 */
users.delete(
    '/',
    auth,
    catcher(async (req, res) => {
        await Team.findByIdAndDelete(req.session.user.id);
        await logOut(req.session, res);

        res.json({ message: MESSAGES.USER.DELETE_SUCCESS });
    })
);

export { users };
