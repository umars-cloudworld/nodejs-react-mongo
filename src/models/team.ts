import { model, Schema } from 'mongoose';

const teamSchema: Schema<TeamDoc> = new Schema(
    {
        name: String,
        tag: String,
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        members: [
            {
                type: Schema.Types.ObjectId,
                ref: 'user'
            }
        ],
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

teamSchema.set('toObject', {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: (_: unknown, { _id, __v, ...rest }: TeamDoc) => {
        return rest;
    },
    virtuals: true
});

teamSchema.set('toJSON', {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transform: (_: unknown, { _id, __v, ...rest }: TeamDoc) => {
        return rest;
    },
    virtuals: true
});

const Team = model<TeamDoc>('team', teamSchema);

export { Team };
