import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_AUTH_USER,
        pass: process.env.MAIL_AUTH_PASS,
    },
});

export const sendMail = async (to: string, subject: string, message: string) => await transporter.sendMail({
    from: `Freebies <${process.env.MAIL_AUTH_USER}>`,
    to,
    subject: subject,
    text: message,
    html: `<p>${message}</P>`,
});
