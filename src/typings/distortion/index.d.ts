import { Session } from 'express-session';
import { Document, ObjectId, Types } from 'mongoose';

declare global {
    // Database
    interface UserDoc extends Document {
        email: string;
        username: string;
        displayName: string;
        dob: Date;
        password: string;
        dailyXP: number;
        verified?: Date;
        banned?: {
            by: string;
            reason: string;
            at: Date;
        };
        role: number;
        games: Array<string>;
        xp: number;
        hasAvatar: boolean;
        tournaments: Array<string>;
        compare: (password: string) => Promise<boolean>;
        getVerificationLink: () => string;
        markAsVerified: (session: Session) => Promise<void>;
        ban: (by: UserDoc, reason: string) => Promise<void>;
        unban: (by: UserDoc) => Promise<void>;
        claimXP: (type: string, session?: Session) => Promise<void>;
    }

    interface TeamDoc extends Document {
        name: string;
        tag: string;
        owner: ObjectId;
        games: Array<string>;
        members: Array<string>;
        tournaments: Array<string>;
        hasAvatar: boolean;
    }

    interface ResetDoc extends Document {
        userId: string;
        getResetLink: () => string;
    }

    interface TournamentDoc extends Document {
        title: string;
        game: string;
        host: string;
        hasStarted: boolean;
        hasEnded: boolean;
        date: Date;
        participants: Types.Array<string>;
        pending?: Types.Array<string>;
        participantsModel: string;
        participantsLimit: number;
        winners: Types.Array<{ userId: string; rank: number; reward: string }>;
        gift: { type: number; reward: string };
    }

    // Joi
    interface Id {
        id: string;
    }

    interface Email {
        email: string;
    }

    interface Register {
        email: string;
        username: string;
        password: string;
        passwordConfirmation: string;
        games: string[];
    }

    interface Login {
        login: string;
        password: string;
    }

    interface EmailVerification {
        id: string;
        state: string;
        exp: string;
    }

    interface NewPassword {
        id: string;
        state: string;
        exp: string;
        password: string;
        passwordConfirmation: string;
    }

    interface Ban {
        params: {
            id: string;
        };
        body: {
            reason: string;
        };
    }

    interface NewTournament {
        title: string;
        date: Date;
        game: string;
        gift: {
            type: number;
            reward: string;
        };
        participantsModel: string;
        participantsLimit: number;
    }

    interface EditTournament {
        params: {
            id: string;
        };
        body: NewTournament;
    }

    interface Participant {
        params: {
            id: string;
        };
        body: {
            participant: string;
        };
    }

    interface Participants {
        params: {
            id: string;
        };
        body: {
            participants: string[];
        };
    }

    interface Winners {
        params: {
            id: string;
        };
        body: {
            winners: {
                userId: string;
                rank: number;
                reward: string;
            }[];
        };
    }

    interface NewTeam {
        name: string;
        tag: string;
        games: string[];
    }

    interface EditTeam {
        params: {
            id: string;
        };
        body: NewTeam;
    }

    interface Member {
        params: {
            id: string;
        };
        body: {
            member: string;
        };
    }

    interface EditUserSettings {
        email: string;
        username: string;
        games: string[];
    }

    interface EditUserPassword {
        currentPassword: string;
        password: string;
        passwordConfirmation: string;
    }

    interface TeamAvatar {
        params: {
            id: string;
        };
        body: {
            type: string;
        };
    }
}
