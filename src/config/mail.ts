import { Options } from 'nodemailer/lib/smtp-connection';
import { APP_HOSTNAME, NODE_ENV } from './app';

const {
    SMTP_HOST = 'smtp.mailtrap.io',
    SMTP_PORT = 2525,
    SMTP_USERNAME = 'f9133786c73e86',
    SMTP_PASSWORD = '88560a05bfa3fe'
} = process.env;

export const SMTP_OPTIONS: Options = {
    host: SMTP_HOST,
    port: +SMTP_PORT,
    secure: NODE_ENV === 'production',
    auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD
    }
};

export const MAIL_NO_REPLY = `no-reply@${APP_HOSTNAME}`;
