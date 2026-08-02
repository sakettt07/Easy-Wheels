import pino from 'pino';

const isServer = typeof window === 'undefined';

export const logger = pino({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  ...(isServer && process.env.NODE_ENV !== 'production'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
          },
        },
      }
    : {}),
});
