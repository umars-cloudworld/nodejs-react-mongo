import { Router } from 'express';
import { MESSAGES } from '../constants';
import { auth } from '../middlewares';
import { Team } from '../models';
import {
    BadRequest,
    catcher,
    editTeamSchema,
    idSchema,
    memberSchema,
    newTeamSchema,
    validate
} from '../modules';

const teams = Router();

/**
 * @api {get} /teams GET - all teams
 * @apiVersion 1.0.0
 * @apiName get
 * @apiGroup teams
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
teams.get(
    '/',
    catcher(async (_, res) => {
        const teams: Array<TeamDoc> = await Team.find();

        res.json({ data: teams });
    })
);

/**
 * @api {post} /teams POST - new team
 * @apiVersion 1.0.0
 * @apiName post
 * @apiGroup teams
 * @apiPermission auth
 *
 * @apiParam (Body) {String} name team name
 * @apiParam (Body) {String} tag team tag
 * @apiParam (Body) {string[]} games team games
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "team_new_success",
 *     }
 *
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "validation_[name|tag|games]"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "team_tag_taken"
 *     }
 *
 * @apiSampleRequest off
 */
teams.post(
    '/',
    auth,
    catcher(async (req, res) => {
        const { name, tag, games } = await validate<NewTeam>(newTeamSchema, req.body);

        if (await Team.exists({ tag })) throw new BadRequest(MESSAGES.TEAM.TAG_TAKEN);

        await Team.create({
            name,
            tag,
            owner: req.session.user.id,
            games
        });

        res.json({ message: MESSAGES.TEAM.NEW_SUCCESS });
    })
);

/**
 * @api {get} /teams/:id GET - team
 * @apiVersion 1.0.0
 * @apiName get-id
 * @apiGroup teams
 * @apiPermission any
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "data": {
 *         "games": [
 *           "league_of_legends",
 *           "cs_go"
 *         ],
 *         "members": [],
 *         "tournaments": [],
 *         "_id": "60182aedfba0f4d743232395",
 *         "name": "ALTTAB GAMING",
 *         "tag": "ALTTAB",
 *         "owner": {
 *           "_id": "6011ad2018ed0fc232b189d5",
 *           "username": "Zeref"
 *         },
 *         "createdAt": "2022-10-11T16:23:09.606Z",
 *         "updatedAt": "2022-10-11T16:23:09.606Z"
 *       }
 *     }
 *
 * @apiSampleRequest off
 */
teams.get(
    '/:id',
    catcher(async (req, res) => {
        const { id } = await validate<Id>(idSchema, req.params);
        const team = await Team.findById(id).populate('owner members tournaments', 'username');

        res.json({ data: team });
    })
);

/**
 * @api {patch} /teams/:id POST - edit team
 * @apiVersion 1.0.0
 * @apiName patch-id
 * @apiGroup teams
 * @apiPermission auth
 *
 * @apiParam (Body) {String} name team name
 * @apiParam (Body) {String} tag team tag
 * @apiParam (Body) {string[]} games team games
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
 *       "message": "validation_[name|tag|games]"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "team_not_owner"
 *     }
 *
 * @apiSampleRequest off
 */
teams.patch(
    '/:id',
    auth,
    catcher(async (req, res) => {
        const { body, params } = await validate<EditTeam>(editTeamSchema, {
            params: req.params,
            body: req.body
        });
        const { id } = params;
        const { name, tag, games } = body;

        const team = await Team.findOneAndUpdate(
            { _id: id, owner: req.session.user.id },
            { name, tag, games },
            { new: true }
        );

        if (!team) throw new BadRequest(MESSAGES.TEAM.NOT_OWNER);

        res.json({ data: team });
    })
);

/**
 * @api {patch} /teams/:id/members PATCH - team members
 * @apiVersion 1.0.0
 * @apiName patch-id-members
 * @apiGroup teams
 * @apiPermission auth
 *
 * @apiParam {String} id team unique identifier
 * @apiParam (Body) {String} member unique id
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "data": {
 *         "games": [
 *           "league_of_legends",
 *           "cs_go"
 *         ],
 *         "members": [
 *           "6011ad2018ed0fc232b189d5"
 *         ],
 *         "tournaments": [],
 *         "_id": "601839805e3844e186a94481",
 *         "name": "ALTTAB GAMING",
 *         "tag": "ALTTAB",
 *         "owner": "6011ad2018ed0fc232b189d5",
 *         "createdAt": "2022-10-11T17:25:20.381Z",
 *         "updatedAt": "2022-10-12T12:43:47.639Z"
 *       }
 *     }
 *
 *
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "validation_[id|member]"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "team_[not_owner|not_found]"
 *     }
 *
 * @apiSampleRequest off
 */
teams.patch(
    '/:id/members',
    auth,
    catcher(async (req, res) => {
        const { params, body } = await validate<Member>(memberSchema, {
            params: req.params,
            body: req.body
        });
        const { id } = params;
        const { member } = body;
        const team = await Team.findOneAndUpdate(
            { _id: id, owner: req.session.user.id },
            { $addToSet: { members: member } },
            { new: true }
        );

        if (!team) throw new BadRequest(MESSAGES.TEAM.NOT_OWNER);

        res.json({ data: team });
    })
);

/**
 * @api {delete} /teams/:id/members DELETE - team members
 * @apiVersion 1.0.0
 * @apiName delete-id-members
 * @apiGroup teams
 * @apiPermission auth
 *
 * @apiParam {String} id team unique identifier
 * @apiParam (Body) {String} member unique id
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "data": {
 *         "games": [
 *           "league_of_legends",
 *           "cs_go"
 *         ],
 *         "members": [
 *           "6011ad2018ed0fc232b189d5"
 *         ],
 *         "tournaments": [],
 *         "_id": "601839805e3844e186a94481",
 *         "name": "ALTTAB GAMING",
 *         "tag": "ALTTAB",
 *         "owner": "6011ad2018ed0fc232b189d5",
 *         "createdAt": "2022-10-11T17:25:20.381Z",
 *         "updatedAt": "2022-10-12T12:43:47.639Z"
 *       }
 *     }
 *
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "validation_[id|member]"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "team_[not_owner|not_found]"
 *     }
 *
 * @apiSampleRequest off
 */
teams.delete(
    '/:id/members',
    auth,
    catcher(async (req, res) => {
        const { params, body } = await validate<Member>(memberSchema, {
            params: req.params,
            body: req.body
        });
        const { id } = params;
        const { member } = body;
        const team = await Team.findOneAndUpdate(
            { _id: id, owner: req.session.user.id },
            { $pull: { members: { $in: [member] } } },
            { new: true }
        );

        if (!team) throw new BadRequest(MESSAGES.TEAM.NOT_OWNER);

        res.json({ data: team });
    })
);

/**
 * @api {delete} /teams/:id DELETE - team
 * @apiVersion 1.0.0
 * @apiName delete-id
 * @apiGroup teams
 * @apiPermission auth
 *
 * @apiParam {String} id team id
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "message": "team_delete_success",
 *     }
 *
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "validation_id"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "team_not_owner"
 *     }
 *
 * @apiSampleRequest off
 */
teams.delete(
    '/:id',
    auth,
    catcher(async (req, res) => {
        const { id } = await validate<Id>(idSchema, req.params);
        const team = await Team.findOneAndDelete({ _id: id, owner: req.session.user.id });

        if (!team) throw new BadRequest(MESSAGES.TEAM.NOT_OWNER);

        res.json({ message: MESSAGES.TEAM.DELETE_SUCCESS });
    })
);

export { teams };
