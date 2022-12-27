import { Router } from 'express';
import { MESSAGES } from '../constants';
import { auth } from '../middlewares';
import { User } from '../models';
import { BadRequest, catcher, idSchema, isStateValid, isVerified, sendVerificationMail, validate, verifyEmailSchema } from '../modules';

const email = Router();

// TODO: to implement: if the email is not verified in 7 days, DELETE it

// TODO: unverified users cannot access their wallet, play tournament

/**
 * @api {post} /email/verify POST - verification
 * @apiVersion 1.0.0
 * @apiName post-verify
 * @apiGroup email
 * @apiPermission auth
 *
 * @apiUse userIdStateExp
 * 
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 * 
 *     {
 *       "message": "email_verification_success",
 *     }
 * 
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 * 
 *     {
 *       "message": "validation_[id|state|expiration]"
 *     }
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 * 
 *     {
 *       "message": "email_[already_verified|invalid_data]"
 *     }
 * 
 * @apiSampleRequest off
 */

email.post('/verify', auth, catcher(async (req, res) => {

    if (isVerified(req.session)) throw new BadRequest(MESSAGES.EMAIL.ALREADY_VERIFIED);

    const { id, state, exp } = await validate<EmailVerification>(verifyEmailSchema, req.body);
    const user = await User.findById(id).select('verified');

    if (!user || !isStateValid(user.id, state, exp)) throw new BadRequest(MESSAGES.EMAIL.INVALID_DATA);

    // extra check
    if (user.verified) throw new BadRequest(MESSAGES.EMAIL.ALREADY_VERIFIED);

    await user.markAsVerified(req.session);

    res.json({ message: MESSAGES.EMAIL.VERIFICATON_SUCCESS });
}));

/**
 * @api {get} /email/resend GET - resend verification
 * @apiVersion 1.0.0
 * @apiName get-resend
 * @apiGroup email
 * @apiPermission auth
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 * 
 *     {
 *       "message": "email_verification_success",
 *     }
 * 
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 * 
 *     {
 *       "message": "email_already_verified"
 *     }
 * 
 * @apiSampleRequest off
 */
email.get('/resend', auth, catcher(async (req, res) => {

    if (isVerified(req.session)) throw new BadRequest(MESSAGES.EMAIL.ALREADY_VERIFIED);

    const { id } = await validate<Id>(idSchema, req.session);
    const user = await User.findById(id).select('email verified');

    if (!user || user.verified) throw new BadRequest(MESSAGES.EMAIL.ALREADY_VERIFIED);

    const link = user.getVerificationLink();

    sendVerificationMail(user.email, link);

    res.json({ message: MESSAGES.EMAIL.VERIFICATON_SUCCESS });
}));

export {
    email
};
