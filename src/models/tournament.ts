import { model, Schema } from 'mongoose';

const tnSchema = new Schema(
    {
        title: String,
        game: String,
        host: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        hasStarted: Boolean,
        hasEnded: Boolean,
        date: Date,
        participants: [
            {
                type: Schema.Types.ObjectId,
                refPath: 'participantsModel'
            }
        ],
        pending: [
            {
                type: Schema.Types.ObjectId,
                refPath: 'participantsModel'
            }
        ],
        participantsModel: {
            type: String,
            enum: ['user', 'team']
        },
        participantsLimit: Number,
        winners: [
            {
                _id: false,
                userId: {
                    type: Schema.Types.ObjectId,
                    ref: 'user'
                },
                rank: Number,
                reward: String
            }
        ],
        gift: Object
    },
    {
        timestamps: true
    }
);

tnSchema.set('toObject', {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: (_: unknown, { _id, __v, ...rest }: TournamentDoc) => {
        return rest;
    },
    virtuals: true
});

tnSchema.set('toJSON', {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: (_: unknown, { _id, __v, ...rest }: TournamentDoc) => {
        return rest;
    },
    virtuals: true
});

const Tournament = model<TournamentDoc>('tournament', tnSchema);

export { Tournament };
