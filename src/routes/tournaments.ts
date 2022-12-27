import { Router } from 'express';
import { MESSAGES, XP } from '../constants';
import { auth, verified } from '../middlewares';
import { Tournament, User } from '../models';
import {
    BadRequest,
    catcher,
    editTournamentSchema,
    idSchema,
    Logger,
    newTournamentSchema,
    participantSchema,
    shuffle,
    validate,
    winnersSchema
} from '../modules';

const tournaments = Router();

/**
 * @api {get} /tournaments GET - all tournaments
 * @apiVersion 1.0.0
 * @apiName get
 * @apiGroup tournaments
 * @apiPermission any
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *     {
 *         "data": [
 *             {
 *                 "participants": [],
 *                 "_id": "60115353e301f3960aef06e2",
 *                 "title": "Zeref Awesome tournament",
 *                 "game": "league_of_legends",
 *                 "host": "600845cd1f882a66f5eddac3",
 *                 "gift": {
 *                     "type": 3,
 *                     "reward": "2000 points"
 *                 },
 *                 "date": "2022-10-20T18:12:21.319Z",
 *                 "participantsModel": "user",
 *                 "winners": [],
 *                 "createdAt": "2022-10-12T11:49:39.471Z",
 *                 "updatedAt": "2022-10-12T11:49:39.471Z"
 *             }
 *         ]
 *     }
 *
 * @apiSampleRequest off
 */
tournaments.get(
    '/',
    catcher(async (_, res) => {
        const tournaments: Array<TournamentDoc> = await Tournament.find();

        res.json({ data: tournaments });
    })
);

/**
 * @api {get} /tournaments/:id GET - tournament
 * @apiVersion 1.0.0
 * @apiName get-id
 * @apiGroup tournaments
 * @apiPermission any
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *        "data": {
 *            "participants": [],
 *            "_id": "60115353e301f3960aef06e2",
 *            "title": "Zeref Awesome tournament",
 *            "game": "league_of_legends",
 *            "host": {
 *                "_id": "600845cd1f882a66f5eddac3",
 *                "username": "Zeref"
 *            },
 *            "gift": {
 *                "type": 3,
 *                "reward": "1000 points"
 *            },
 *            "date": "2022-10-20T18:12:21.319Z",
 *            "participantsModel": "user",
 *            "winners": [],
 *            "createdAt": "2022-10-12T11:49:39.471Z",
 *            "updatedAt": "2022-10-12T11:49:39.471Z"
 *        }
 *     }
 *
 * @apiSampleRequest off
 */
tournaments.get(
    '/:id',
    catcher(async (req, res) => {
        const { id } = await validate<Id>(idSchema, req.params);

        const tn = await Tournament.findById(id).populate('host participants winners', 'username');

        res.json({ data: tn });
    })
);

/**
 * @api {post} /tournaments POST - new tournament
 * @apiVersion 1.0.0
 * @apiName post
 * @apiGroup tournaments
 * @apiPermission auth
 *
 * @apiParam (Body) {String} title tournament title
 * @apiParam (Body) {String} game tournament game
 * @apiParam (Body) {Object} gift tournament gift/prize
 * @apiParam (Body) {Number} gift.type tournament gift type
 * @apiParam (Body) {String} gift.reward tournament gift reward
 * @apiParam (Body) {Date} date tournament date
 * @apiParam (Body) {String} participantsModel user/team
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "tournament_new_success",
 *     }
 *
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "validation_[title|game|gift|date|participantsModel]"
 *     }
 *
 * @apiSampleRequest off
 */
tournaments.post(
    '/',
    auth,
    catcher(async (req, res) => {
        const { date, game, gift, participantsLimit, participantsModel, title } =
            await validate<NewTournament>(newTournamentSchema, req.body);

        await Tournament.create({
            title,
            game,
            host: req.session.user.id,
            hasStarted: false,
            hasEnded: false,
            gift,
            date,
            participantsModel,
            participantsLimit
        });

        res.json({ message: MESSAGES.TOURNAMENT.NEW_SUCCESS });
    })
);

/**
 * @api {patch} /tournaments/:id PATCH - edit tournament
 * @apiVersion 1.0.0
 * @apiName patch-id
 * @apiGroup tournaments
 * @apiPermission auth
 *
 * @apiParam (Body) {String} title tournament title
 * @apiParam (Body) {String} game tournament game
 * @apiParam (Body) {Object} gift tournament gift/prize
 * @apiParam (Body) {Number} gift.type tournament gift type
 * @apiParam (Body) {String} gift.reward tournament gift reward
 * @apiParam (Body) {Date} date tournament date
 * @apiParam (Body) {String} participantsModel user/team
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *         "data": {
 *             "participants": [
 *                 "600845cd1f882a66f5eddac3"
 *             ],
 *             "_id": "60115353e301f3960aef06e2",
 *             "title": "Zeref Awesome tournament",
 *             "game": "league_of_legends",
 *             "host": "600845cd1f882a66f5eddac3",
 *             "gift": {
 *                 "type": 3,
 *                 "reward": "1000 points"
 *             },
 *             "date": "2022-10-20T18:12:21.319Z",
 *             "participantsModel": "user",
 *             "winners": [],
 *             "createdAt": "2022-10-12T11:49:39.471Z",
 *             "updatedAt": "2022-10-12T12:43:56.240Z"
 *         }
 *     }
 *
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "validation_[title|game|gift|date|participantsModel]"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "tournament_not_host"
 *     }
 *
 * @apiSampleRequest off
 */
tournaments.patch(
    '/:id',
    auth,
    catcher(async (req, res) => {
        const { body, params } = await validate<EditTournament>(editTournamentSchema, {
            params: req.params,
            body: req.body
        });
        const { id } = params;
        const { title, game, gift, date, participantsModel, participantsLimit } = body;
        const tn = await Tournament.findOneAndUpdate(
            { _id: id, host: req.session.user.id },
            { title, game, gift, date, participantsModel, participantsLimit },
            { new: true }
        );

        if (!tn) throw new BadRequest(MESSAGES.TOURNAMENT.NOT_FOUND);

        res.json({ data: tn });
    })
);

// TODO: get players as they were put in the bracket and update the document..
/**
 * @api {patch} /tournaments/:id/start PATCH - start tournament
 * @apiVersion 1.0.0
 * @apiName patch-id-start
 * @apiGroup tournaments
 * @apiPermission auth
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *         "data": {
 *             "participants": [
 *                 "600845cd1f882a66f5eddac3"
 *             ],
 *             "_id": "60115353e301f3960aef06e2",
 *             "title": "Zeref Awesome tournament",
 *             "game": "league_of_legends",
 *             "host": "600845cd1f882a66f5eddac3",
 *             "gift": {
 *                 "type": 3,
 *                 "reward": "1000 points"
 *             },
 *             "date": "2022-10-20T18:12:21.319Z",
 *             "participantsModel": "user",
 *             "winners": [],
 *             "createdAt": "2022-10-12T11:49:39.471Z",
 *             "updatedAt": "2022-10-12T12:43:56.240Z"
 *         }
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
 *       "message": "tournament_[not_found|has_started]"
 *     }
 *
 * @apiSampleRequest off
 */
tournaments.patch(
    '/:id/start',
    auth,
    catcher(async (req, res) => {
        const { id } = await validate<Id>(idSchema, req.params);
        const tn = await Tournament.findOne({ _id: id, host: req.session.user.id });

        if (!tn) throw new BadRequest(MESSAGES.TOURNAMENT.NOT_FOUND);

        if (tn.hasStarted) throw new BadRequest(MESSAGES.TOURNAMENT.HAS_STARTED);

        tn.hasStarted = true;
        await tn.save();

        res.json({ data: tn });
    })
);

/**
 * @api {patch} /tournaments/:id/join PATCH - request join a tournament
 * @apiVersion 1.0.0
 * @apiName patch-id-join
 * @apiGroup tournaments
 * @apiPermission auth
 *
 * @apiParam {String} id tournament unique identifier
 * @apiParam (Body) {String} player/team id
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "data": {
 *         "participants": [],
 *         "pending": [
 *           "6011ad2018ed0fc232b189d5"
 *         ],
 *         "_id": "601bfe79032e2d77d99d276c",
 *         "title": "Valorant awesome tournament",
 *         "game": "valorant",
 *         "host": "6011ad2018ed0fc232b189d5",
 *         "gift": {
 *           "type": 1,
 *           "reward": "Cash: 100$"
 *         },
 *         "date": "2021-03-28T19:28:59.000Z",
 *         "participantsModel": "user",
 *         "participantsLimit": 8,
 *         "winners": [],
 *         "createdAt": "2021-02-04T14:02:33.401Z",
 *         "updatedAt": "2021-02-04T14:24:09.923Z"
 *       }
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
 *       "message": "tournament_[not_found|participant_exists|has_started]"
 *     }
 *
 * @apiSampleRequest off
 */
tournaments.patch(
    '/:id/join',
    auth,
    verified,
    catcher(async (req, res) => {
        const { id } = await validate<Id>(idSchema, req.params);
        const userId = req.session.user.id as string;
        const tn = await Tournament.findById(id);

        if (!tn) throw new BadRequest(MESSAGES.TOURNAMENT.NOT_FOUND);

        if (tn.hasStarted) throw new BadRequest(MESSAGES.TOURNAMENT.HAS_STARTED);

        if (tn.participants.includes(userId)) {
            throw new BadRequest(MESSAGES.TOURNAMENT.PARTICIPANT_EXISTS);
        }

        tn.pending?.addToSet(userId);
        await tn.save();

        res.json({ data: tn });
    })
);

/**
 * @api {patch} /tournaments/:id/participants PATCH - add a participant
 * @apiVersion 1.0.0
 * @apiName patch-id-participants
 * @apiGroup tournaments
 * @apiPermission auth
 *
 * @apiParam {String} id tournament unique identifier
 * @apiParam (Body) {String} participant player/team id
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *         "data": {
 *             "participant": "600845cd1f882a66f5eddac3",
 *             "_id": "60115353e301f3960aef06e2",
 *             "title": "Zeref Awesome tournament",
 *             "game": "league_of_legends",
 *             "host": "600845cd1f882a66f5eddac3",
 *             "gift": {
 *                 "type": 3,
 *                 "reward": "1000 points"
 *             },
 *             "date": "2022-10-20T18:12:21.319Z",
 *             "participantsModel": "user",
 *             "winners": [],
 *             "createdAt": "2022-10-12T11:49:39.471Z",
 *             "updatedAt": "2022-10-12T12:43:56.240Z"
 *         }
 *     }
 *
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "validation_[id|participant]"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "tournament_not_found"
 *     }
 *
 * @apiSampleRequest off
 */
tournaments.patch(
    '/:id/participants',
    auth,
    catcher(async (req, res) => {
        const { body, params } = await validate<Participant>(participantSchema, {
            params: req.params,
            body: req.body
        });
        const { id } = params;
        const { participant } = body;
        const tn = await Tournament.findOne({ _id: id, host: req.session.user.id });

        if (!tn) throw new BadRequest(MESSAGES.TOURNAMENT.NOT_FOUND);

        if (tn.participants.length >= tn.participantsLimit) {
            throw new BadRequest(MESSAGES.TOURNAMENT.PARTICIPANTS_LIMIT);
        }

        tn.participants.addToSet(participant);
        tn.pending?.pull(participant);
        await tn.save();

        res.json({ data: tn });
    })
);

/**
 * @api {patch} /tournament/:id/winners PATCH - tournament winners
 * @apiVersion 1.0.0
 * @apiName patch-id-winners
 * @apiGroup tournaments
 * @apiPermission auth
 *
 * @apiParam {String} id tournament unique identifier
 * @apiParam (Body) {Object[]} winners list of winners
 * @apiParam (Body) {String} winners.id id of player/team
 * @apiParam (Body) {Number} winners.rank rank [1,2,3...]
 * @apiParam (Body) {String} winners.reward winner reward
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *         "data": {
 *             "participants": [
 *                 "600845cd1f882a66f5eddac3"
 *             ],
 *             "_id": "60115353e301f3960aef06e2",
 *             "title": "Zeref Awesome tournament",
 *             "game": "league_of_legends",
 *             "gift": {
 *                 "type": 3,
 *                 "reward": "1000 points"
 *             },
 *             "date": "2022-10-20T18:12:21.319Z",
 *             "participantsModel": "user",
 *             "winners": [
 *                 "600845cd1f882a66f5eddac3"
 *             ],
 *             "createdAt": "2022-10-12T11:49:39.471Z",
 *             "updatedAt": "2022-10-12T12:43:56.240Z"
 *         }
 *     }
 *
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "validation_[id|winners]"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "tournament_[not_host|has_ended]"
 *     }
 *
 * @apiSampleRequest off
 */
tournaments.patch(
    '/:id/winners',
    auth,
    catcher(async (req, res) => {
        const { params, body } = await validate<Winners>(winnersSchema, {
            params: req.params,
            body: req.body
        });
        const { id } = params;
        const { winners } = body;
        const tn = await Tournament.findOne({ _id: id, host: req.session.user.id });

        if (!tn) throw new BadRequest(MESSAGES.TOURNAMENT.NOT_FOUND);

        if (tn.hasEnded) throw new BadRequest(MESSAGES.TOURNAMENT.HAS_ENDED);

        tn.hasEnded = true;
        tn.winners.push(winners);
        delete tn.pending;

        await tn.save();

        const host = await User.findById(req.session.user.id);

        await host?.claimXP(XP.TN_HOST, req.session);

        for (let i = 0; i < tn.participants.length; i++) {
            const participant = tn.participants[i];
            const participantDoc = await User.findById(participant);

            if (!participantDoc) {
                Logger.warn('tournaments:participants:xp', participant + ' document was not found');
                continue;
            }

            await participantDoc.claimXP(XP.TN_PARTICIPATION);
        }

        res.json({ data: tn });
    })
);

/**
 * @api {patch} /tournaments/:id/shuffle PATCH - shuffle the participants/teams
 * @apiVersion 1.0.0
 * @apiName patch-id-shuffle
 * @apiGroup tournaments
 * @apiPermission auth
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "data":
 *          {
 *            "participants": [],
 *            "pending": [],
 *            "_id": "601bfe79032e2d77d99d276c",
 *            "title": "Valorant awesome tournament",
 *            "game": "valorant",
 *            "host": "6011ad2018ed0fc232b189d5",
 *            "gift": {
 *              "type": 1,
 *              "reward": "Cash: 100$"
 *            },
 *            "date": "2021-03-28T19:28:59.000Z",
 *            "participantsModel": "user",
 *            "participantsLimit": 8,
 *            "winners": [],
 *            "createdAt": "2021-02-04T14:02:33.401Z",
 *            "updatedAt": "2021-02-04T14:34:38.411Z"
 *          },
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
 *       "message": "tournament_[not_found|has_started]"
 *     }
 *
 * @apiSampleRequest off
 */
tournaments.patch(
    '/:id/shuffle',
    auth,
    catcher(async (req, res) => {
        const { id } = await validate<Id>(idSchema, req.params);
        const tn = await Tournament.findOne({ _id: id, host: req.session.user.id });

        if (!tn) throw new BadRequest(MESSAGES.TOURNAMENT.NOT_FOUND);

        if (tn.hasStarted) throw new BadRequest(MESSAGES.TOURNAMENT.HAS_STARTED);

        shuffle(tn.participants);
        await tn.save();

        res.json({ data: tn });
    })
);

/**
 * @api {delete} /tournaments/:id DELETE - tournament
 * @apiVersion 1.0.0
 * @apiName delete-id
 * @apiGroup tournaments
 * @apiPermission auth
 *
 * @apiParam {String} id tournament id
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *       "message": "tournament_delete_success",
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
 *       "message": "tournament_not_host"
 *     }
 *
 * @apiSampleRequest off
 */
tournaments.delete(
    '/:id',
    auth,
    catcher(async (req, res) => {
        const { id } = await validate<Id>(idSchema, req.params);

        // TODO: use deleteOne in case we don't need the deleted tournament
        const tn = await Tournament.findOneAndDelete({ _id: id, host: req.session.user.id });

        if (!tn) throw new BadRequest(MESSAGES.TOURNAMENT.NOT_FOUND);

        res.json({ message: MESSAGES.TOURNAMENT.DELETE_SUCCESS });
    })
);

/**
 * @api {delete} /tournaments/:id/participants DELETE - remove a participant
 * @apiVersion 1.0.0
 * @apiName delete-id-participants
 * @apiGroup tournaments
 * @apiPermission auth
 *
 * @apiParam {String} id tournament unique identifier
 * @apiParam (Body) {String} participant player/team id
 *
 * @apiSuccessExample Success:
 *     HTTP/1.1 200 OK
 *
 *     {
 *         "data": {
 *             "participants": [
 *                 "600845cd1f882a66f5eddac3"
 *             ],
 *             "_id": "60115353e301f3960aef06e2",
 *             "title": "Zeref Awesome tournament",
 *             "game": "league_of_legends",
 *             "gift": {
 *                 "type": 3,
 *                 "reward": "1000 points"
 *             },
 *             "date": "2022-10-20T18:12:21.319Z",
 *             "participantsModel": "user",
 *             "winners": [],
 *             "createdAt": "2022-10-12T11:49:39.471Z",
 *             "updatedAt": "2022-10-12T12:43:56.240Z"
 *         }
 *     }
 *
 * @apiErrorExample Error - Validation:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "validation_[id|participant]"
 *     }
 *
 * @apiErrorExample Error - Verification:
 *     HTTP/1.1 400 Bad Request
 *
 *     {
 *       "message": "tournament_[not_found|has_ended]"
 *     }
 *
 * @apiSampleRequest off
 */
tournaments.delete(
    '/:id/participants',
    auth,
    catcher(async (req, res) => {
        const { body, params } = await validate<Participant>(participantSchema, {
            params: req.params,
            body: req.body
        });
        const { id } = params;
        const { participant } = body;
        const tn = await Tournament.findOne({ _id: id, host: req.session.user.id });

        if (!tn) throw new BadRequest(MESSAGES.TOURNAMENT.NOT_FOUND);

        if (tn.hasEnded) throw new BadRequest(MESSAGES.TOURNAMENT.HAS_ENDED);

        tn.participants.pull(participant);
        await tn.save();

        res.json({ data: tn });
    })
);

export { tournaments };
