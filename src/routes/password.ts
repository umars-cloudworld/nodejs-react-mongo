import { Router } from 'express';
import { MESSAGES } from '../constants';
import { guest } from '../middlewares';
import { Reset, User } from '../models';
import { BadRequest, catcher, emailSchema, isStateValid, newPasswordSchema, sendPasswordResetMail, validate } from '../modules';

const password = Router();

/**
 * @api {patch} /password/new PATCH - new password request
 * @apiVersion 1.0.0
 * @apiName patch-new
 * @apiGroup password
 * @apiPermission guest
 *
 * @apiUse userIdStateExp
 * @apiUse userPasswordAndConfirmation
 * 
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 * 
 *     {
 *       "message": "password_new_success",
 *     }
 * 
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 * 
 *     {
 *       "message": "validation_[id|state|expiration|password|passwordConfirmation]"
 *     }
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 * 
 *     {
 *       "message": "password_new_invalid"
 *     }
 * 
 * @apiSampleRequest off
 */
password.patch('/new', guest, catcher(async (req, res) => {

    const { id, exp, state, password } = await validate<NewPassword>(newPasswordSchema, req.body);
    const reset = await Reset.findById(id);

    if (!reset || !isStateValid(reset.id, state, exp)) throw new BadRequest(MESSAGES.PASSWORD.INVALID);

    const user = await User.findById(reset.userId);

    if (!user) throw new BadRequest(MESSAGES.PASSWORD.INVALID);

    user.password = password;
    await user.save();
    await Reset.deleteMany({ userId: reset.userId });

    res.json({ message: MESSAGES.PASSWORD.SUCCESS });

}));

/**
 * @api {post} /password/reset POST - reset password
 * @apiVersion 1.0.0
 * @apiName post-reset
 * @apiGroup password
 * @apiPermission guest
 *
 * @apiParam (Body) {String} email user email
 * 
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 * 
 *     {
 *       "message": "password_reset_answer",
 *     }
 * 
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 * 
 *     {
 *       "message": "validation_email"
 *     }
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 * 
 *     {
 *       "message": "password_reset_answer"
 *     }
 * 
 * @apiSampleRequest off
 */
password.post('/reset', guest, catcher(async (req, res) => {

    const { email } = await validate<Email>(emailSchema, req.body);
    const user = await User.findOne({ email });

    if (user) {
        const reset = await Reset.create<Partial<ResetDoc>>({ userId: user.id });
        const link = reset.getResetLink();

        sendPasswordResetMail(email, link);
    }

    res.json({ message: MESSAGES.PASSWORD.RESET_ANSWER });
}));

export {
    password
};
