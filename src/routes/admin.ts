import { Router } from 'express';
import { APP } from '../config';
import { MESSAGES } from '../constants';
import { auth, staff } from '../middlewares';
import { User } from '../models';
import { BadRequest, banSchema, catcher, idSchema, ROLES, validate } from '../modules';

const admin = Router();

// application

/**
 * @api {patch} /admin/app/maintenance/enable - PATCH enable maintenance mode
 * @apiVersion 1.0.0
 * @apiName patch-app-maintenance-enable
 * @apiGroup admin
 * @apiPermission admin
 *
 * @apiParam (Body) {String} test
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "message": "app_maintenance_success",
 *     }
 *
 * @apiSampleRequest off
 */
admin.patch('/app/maintenance/enable', auth, staff, (_, res) => {
    APP.MAINTENANCE = true;

    res.json({ message: MESSAGES.MAINTENANCE_SUCCESS });
});

/**
 * @api {patch} /admin/app/maintenance/disable - PATCH disable maintenance mode
 * @apiVersion 1.0.0
 * @apiName patch-app-maintenance-disable
 * @apiGroup admin
 * @apiPermission admin
 *
 * @apiParam (Body) {String} test
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "message": "app_maintenance_success",
 *     }
 *
 * @apiSampleRequest off
 */
admin.patch('/app/maintenance/disable', auth, staff, (_, res) => {
    APP.MAINTENANCE = false;

    res.json({ message: MESSAGES.MAINTENANCE_SUCCESS });
});

// users routes

/**
 * @api {patch} /admin/users/:id/ban PATCH - ban user
 * @apiVersion 1.0.0
 * @apiName patch-users-id-ban
 * @apiGroup admin
 * @apiPermission admin
 *
 * @apiParam (Body) {String} reason reason of the ban
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "message": "user_ban_success"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "user_[not_found|already_banned|ban_fail_admin]"
 *     }
 *
 * @apiSampleRequest off
 */
admin.patch(
    '/users/:id/ban',
    auth,
    staff,
    catcher(async (req, res) => {
        const { body, params } = await validate<Ban>(banSchema, {
            params: req.params,
            body: req.body
        });

        const { id } = params;
        const { reason } = body;

        const user = await User.findById(id);

        if (!user) throw new BadRequest(MESSAGES.USER.NOT_FOUND);

        if (user.role === ROLES.ADMINISTRATOR) throw new BadRequest(MESSAGES.USER.BAN_FAIL_ADMIN);

        if (user.banned) throw new BadRequest(MESSAGES.USER.ALREADY_BANNED);

        await user.ban(req.session.user, reason);

        res.json({ message: MESSAGES.USER.BAN_SUCCESS });
    })
);

/**
 * @api {patch} /admin/users/:id/unban PATCH - unban user
 * @apiVersion 1.0.0
 * @apiName patch-users-id-unban
 * @apiGroup admin
 * @apiPermission admin
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "message": "user_unban_success"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "user_[not_found|not_banned]"
 *     }
 *
 * @apiSampleRequest off
 */
admin.patch(
    '/users/:id/unban',
    auth,
    staff,
    catcher(async (req, res) => {
        const { id } = await validate<Id>(idSchema, req.params);
        const user = await User.findById(id);

        if (!user) throw new BadRequest(MESSAGES.USER.NOT_FOUND);

        if (!user.banned) throw new BadRequest(MESSAGES.USER.NOT_BANNED);

        await user.unban(req.session.user);

        res.json({ message: MESSAGES.USER.UNBAN_SUCCESS });
    })
);

export { admin };
