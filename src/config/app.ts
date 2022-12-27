export const {
    NODE_ENV = 'development',
    APP_PORT = '3000',
    APP_HOSTNAME = 'localhost',
    APP_PROTOCOL = 'http',
    APP_SECRET = 'secret'
} = process.env;

export const APP_ORIGIN = `${APP_PROTOCOL}://${APP_HOSTNAME}:${APP_PORT}`;

// TODO: make it persistent
export const APP = {
    MAINTENANCE: false
};
