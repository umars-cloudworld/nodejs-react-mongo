// TODO: Switch to POSTGRESQL in v1
import { ConnectOptions } from 'mongoose';

const {
    MONGO_USERNAME = 'admin',
    MONGO_PASSWORD = 'secret',
    MONGO_HOST = 'localhost',
    MONGO_PORT = 27017,
    MONGO_DATABASE = 'lab'
} = process.env;

export const MONGO_URI = `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DATABASE}`;
export const MONGO_OPTIONS: ConnectOptions = {
    authSource: MONGO_DATABASE,
    auth: {
        username: MONGO_USERNAME,
        password: MONGO_PASSWORD
    }
};
