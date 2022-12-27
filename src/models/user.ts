/* eslint-disable indent */
import { Session } from 'express-session';
import { model, Schema } from 'mongoose';
import { store } from '..';
import { APP_ORIGIN, EMAIL_VERIFICATION_TIMEOUT, PASSWORD_RESET_TIMEOUT } from '../config';
import { XP } from '../constants';
import { compare, createState, hash, Logger } from '../modules';

const userSchema = new Schema<UserDoc>(
    {
        email: {
            type: String,
            unique: true
        },
        username: {
            type: String,
            unique: true
        },
        displayName: String,
        dob: Date,
        password: String,
        verified: Date,
        banned: Object,
        role: Number,
        xp: Number,
        games: Array,
        tournaments: [
            {
                type: Schema.Types.ObjectId,
                ref: 'tournament'
            }
        ],
        hasAvatar: Boolean
    },
    {
        timestamps: true
    }
);

const resetSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        }
    },
    {
        timestamps: true
    }
);

// before saving the user data in the database,
// if the password has been modified, encrypt it.
userSchema.pre('save', async function () {
    if (this.isModified('password')) {
        this.password = await hash(this.password);
    }
});

// compare the provided password with the hash stored in the database
userSchema.methods.compare = function (password: string) {
    return compare(password, this.password);
};

// create a email verification link
userSchema.methods.getVerificationLink = function () {
    const exp = Date.now() + EMAIL_VERIFICATION_TIMEOUT;
    const url = `${APP_ORIGIN}/email/verify?id=${this.id}&exp=${exp}`;
    const state = createState(this.id + exp);

    return `${url}&state=${state}`;
};

userSchema.methods.markAsVerified = async function (session: Session) {
    const date = new Date();

    this.verified = date;
    session.user.verified = date;

    await this.claimXP(XP.EMAIL_VERIFICATION, session);

    // TODO: test this
    // await this.save();
};

userSchema.methods.ban = async function (by: UserDoc, reason: string) {
    this.banned = {
        by: by.id,
        reason,
        at: new Date()
    };

    if (store.all) {
        store.all((error, data) => {
            if (error) return Logger.error('store', error);

            const target = data.find((s) => s.user.id === this.id);

            if (target) {
                store.destroy(target.id, (error) => {
                    if (error) Logger.error('store', error);
                });
            }
        });
    }

    await this.save();

    Logger.success(
        'user:ban',
        `${this.username} (${this.id}) has been banned by ${by.username} (${by.id})`
    );
};

userSchema.methods.unban = async function (by: UserDoc) {
    this.banned = undefined;

    await this.save();

    Logger.success(
        'user:unban',
        `${this.username} (${this.id}) has been unbanned by ${by.username} (${by.id})`
    );
};

userSchema.methods.claimXP = async function (type: string, session?: Session) {
    switch (type) {
        case XP.AVATAR:
            // TODO: the 100 should go in config folder
            this.xp = this.xp + 100;

            if (session) {
                session.user.xp = this.xp;
                session.user.hasAvatar = true;
            }

            break;
        case XP.DAILY:
            this.xp = this.xp + 100;
            this.dailyXP = Date.now();

            if (session) {
                session.user.xp = this.xp;
                session.user.dailyXP = this.dailyXP;
            }

            break;
        case XP.TN_PARTICIPATION:
            this.xp = this.xp + 100;

            break;
        case XP.TN_HOST:
            this.xp = this.xp + 100;

            if (session) {
                session.user.xp = this.xp;
            }

            break;
        case XP.EMAIL_VERIFICATION:
            this.xp = this.xp + 100;

            if (session) {
                session.user.xp = this.xp;
            }

            break;
        default:
            Logger.warn('user:claimXP', type + ' is unknown');
            break;
    }

    await this.save();
    Logger.success(
        'user:claimXP',
        `${this.username} (${this.id}) has successfully claimed ${type}`
    );
};

userSchema.set('toObject', {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: (_: unknown, { _id, __v, password, ...rest }: UserDoc) => {
        return rest;
    },
    virtuals: true
});

userSchema.set('toJSON', {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: (_: unknown, { _id, __v, password, ...rest }: UserDoc) => {
        return rest;
    },
    virtuals: true
});

resetSchema.methods.getResetLink = function () {
    const exp = Date.now() + PASSWORD_RESET_TIMEOUT;
    const url = `${APP_ORIGIN}/password/reset?id=${this.id}&exp=${exp}`;
    const state = createState(this.id + exp);

    return `${url}&state=${state}`;
};

const User = model<UserDoc>('user', userSchema);
const Reset = model<ResetDoc>('reset', resetSchema);

export { User, Reset };
