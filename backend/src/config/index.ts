import dotenv from 'dotenv';

dotenv.config();

export const config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),

    database: {
        url: process.env.DATABASE_URL || '',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-me',
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    },

    storage: {
        uploadDir: process.env.UPLOAD_DIR || './uploads',
        maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB default
    },

    logging: {
        level: process.env.LOG_LEVEL || 'debug',
    },
};

export default config;
