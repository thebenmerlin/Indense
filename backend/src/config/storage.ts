import path from 'path';
import { config } from './index';

export const storageConfig = {
    uploadDir: path.resolve(config.storage.uploadDir),
    maxFileSize: config.storage.maxFileSize,

    allowedMimeTypes: {
        images: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
        documents: ['application/pdf'],
    },

    directories: {
        receipts: 'receipts',
        damages: 'damages',
    },
};

export default storageConfig;
