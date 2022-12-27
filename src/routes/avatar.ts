import { Router } from 'express';
import { auth, upload } from '../middlewares';

const avatar = Router();

/**
 * @api {post} /avatar/:id POST - upload user or team avatar
 * @apiVersion 1.0.0
 * @apiName post-id
 * @apiGroup avatar
 * @apiPermission auth
 *
 * @apiParam (Body) {String} type must be "user" or "team"
 * 
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 * 
 *     {
 *       "message": "upload_success",
 *     }
 * 
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 * 
 *     {
 *       "message": "validation_avatar_type"
 *     }
 * 
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 * 
 *     {
 *       "message": "team_not_owner|upload_[images_only|limit_file_size|limit_file_unexpected|unknown]"
 *     }
 * 
 * @apiSampleRequest off
 */
avatar.post('/:id', auth, upload);

export {
    avatar
};
