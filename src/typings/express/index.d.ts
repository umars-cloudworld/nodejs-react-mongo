declare namespace Express {
    interface Request {
        date: string;
        team?: TeamDoc;
        user?: UserDoc;
        // session: {
        //     user: UserDoc;
        //     createdAt: number;
        // };
    }
}
