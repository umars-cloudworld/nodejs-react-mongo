import { createTransport, SendMailOptions, SentMessageInfo } from 'nodemailer';
import { Logger } from '.';
import { MAIL_NO_REPLY as MAIL_NO_REPLY, SMTP_OPTIONS } from '../config';
import { NODE_ENV } from './../config/app';

const transporter = createTransport(SMTP_OPTIONS);

const sendMail = (options: SendMailOptions): Promise<SentMessageInfo> => transporter.sendMail({
    ...options
});

export const sendVerificationMail = async (email: string, link: string): Promise<void> => {
    if (NODE_ENV === 'production') {
        try {
            await sendMail({
                from: MAIL_NO_REPLY,
                to: email,
                subject: 'Verify your email address',
                text: link,
                priority: 'high'
            });
        } catch (err) {
            Logger.error('mailer', err);
        }
    }
};

export const sendPasswordResetMail = async (email: string, link: string): Promise<void> => {
    try {
        await sendMail({
            from: MAIL_NO_REPLY,
            to: email,
            subject: 'Reset your password',
            text: link,
            priority: 'high'
        });
    } catch (err) {
        Logger.error('mailer', err);
    }
};
