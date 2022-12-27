import { Router } from 'express';
import { MESSAGES } from '../constants';
import { auth } from '../middlewares';
import { catcher, logOut } from '../modules';

const logout = Router();

/**
 * @api {post} /logout POST - logout
 * @apiVersion 1.0.0
 * @apiName post
 * @apiGroup logout
 * @apiPermission auth
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 * 
 *     {
 *       "message": "logout_success",
 *     }
 * 
 * @apiSampleRequest off
 */
logout.post('/', auth, catcher(async (req, res) => {

    await logOut(req.session, res);

    res.json({ message: MESSAGES.LOGOUT.SUCCESS });
}
));

export {
    logout
};
