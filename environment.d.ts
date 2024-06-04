declare global {
    namespace NodeJS {
        interface ProcessEnv {
            PORT: number;
            JWT_SECRET: string;
            DATABASE_URL: string;
            MAIL_AUTH_USER: string;
            MAIL_AUTH_PASS: string;
        }
    }
}

export {};
