import pino from 'pino';

const logger = pino.default({
    base: { pid: false },
    transport: { target: 'pino-pretty' }
});

export default logger;
