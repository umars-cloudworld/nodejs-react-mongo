import Joi from 'joi';
import { GAMES, MESSAGES, PARTICIPANTS_MODEL } from '../constants';
import * as joi from './joi';

const email = joi.email(MESSAGES.VALIDATION.EMAIL);
const username = joi.username(MESSAGES.VALIDATION.USERNAME);
const password = joi.password(MESSAGES.VALIDATION.PASSWORD);
const passwordConfirmation = joi.confirmation('password', MESSAGES.VALIDATION.CONFIRMATION);
const id = joi.id(MESSAGES.VALIDATION.ID);
const state = joi.state(MESSAGES.VALIDATION.STATE);
const exp = joi.expiration(MESSAGES.VALIDATION.EXP);
const games = joi.ArrayOfValidatedStrings(Object.values(GAMES), MESSAGES.VALIDATION.GAMES);

export const validate = joi.validateAsync;

export const idSchema = Joi.object({
    id
});

export const emailSchema = Joi.object({
    email
});

export const registerSchema = Joi.object({
    email, // TODO: make optional as requested.
    username,
    dob: joi.date(MESSAGES.VALIDATION.DOB),
    password,
    passwordConfirmation,
    games
});

export const loginSchema = Joi.object({
    login: joi.login(MESSAGES.VALIDATION.LOGIN),
    password
});

export const verifyEmailSchema = Joi.object({
    id,
    state,
    exp
});

export const newPasswordSchema = Joi.object({
    id,
    state,
    exp,
    password,
    passwordConfirmation
});

export const banSchema = Joi.object({
    params: Joi.object({
        id
    }),
    body: Joi.object({
        reason: joi.title(MESSAGES.VALIDATION.BAN_REASON)
    })
});

export const newTournamentSchema = Joi.object({
    title: joi.title(MESSAGES.VALIDATION.TITLE),
    date: joi.date(MESSAGES.VALIDATION.DATE),
    game: joi.validatedString(Object.values(GAMES), MESSAGES.VALIDATION.GAME),
    gift: Joi.object({
        type: joi.username(MESSAGES.VALIDATION.GIFT_TYPE),
        reward: joi.title(MESSAGES.VALIDATION.GIFT_REWARD)
    }).required(),
    participantsModel: joi.validatedString(
        PARTICIPANTS_MODEL,
        MESSAGES.VALIDATION.PARTICIPANTS_MODEL
    ),
    participantsLimit: joi.positiveNumber(MESSAGES.VALIDATION.PARTICIPANTS_LIMIT)
});

export const editTournamentSchema = Joi.object({
    params: Joi.object({
        id
    }),
    body: newTournamentSchema
});

export const participantSchema = Joi.object({
    params: Joi.object({
        id
    }),
    body: Joi.object({
        participant: id
    })
});

export const participantsSchema = Joi.object({
    params: Joi.object({
        id
    }),
    body: Joi.object({
        participants: joi.participants(MESSAGES.VALIDATION.PARTICIPANTS)
    })
});

export const winnersSchema = Joi.object({
    params: Joi.object({
        id
    }),
    body: Joi.object({
        winners: Joi.array()
            .items(
                Joi.object({
                    userId: id,
                    rank: joi.positiveNumber(MESSAGES.VALIDATION.RANK),
                    reward: joi.title(MESSAGES.VALIDATION.GIFT_REWARD)
                }).required()
            )
            .required()
            .error(new Error(MESSAGES.VALIDATION.WINNERS_MODEL))
    })
});

export const newTeamSchema = Joi.object({
    name: joi.title(MESSAGES.VALIDATION.NAME),
    tag: joi.title(MESSAGES.VALIDATION.TAG, 3, 6),
    games
});

export const editTeamSchema = Joi.object({
    params: Joi.object({
        id
    }),
    body: newTeamSchema
});

export const memberSchema = Joi.object({
    params: Joi.object({
        id
    }),
    body: Joi.object({
        member: id
    })
});

export const editUserSettingsSchema = Joi.object({
    email,
    username,
    games
});

export const editUserPasswordSchema = Joi.object({
    currentPassword: password,
    password,
    passwordConfirmation
});

export const teamAvatarSchema = Joi.object({
    params: Joi.object({
        id
    }),
    body: Joi.object({
        type: joi.validatedString(['user', 'team'], MESSAGES.VALIDATION.AVATAR_TYPE)
    })
});

export const maintenanceSchema = Joi.object({
    toggle: joi.yesOrNo(MESSAGES.VALIDATION.MAINTENANCE)
});
