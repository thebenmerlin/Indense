import { config } from './index';

export const authConfig = {
    jwt: {
        secret: config.jwt.secret,
        accessTokenExpiresIn: config.jwt.expiresIn,
        refreshTokenExpiresIn: config.jwt.refreshExpiresIn,
    },

    bcrypt: {
        saltRounds: 10,
    },

    password: {
        minLength: 8,
    },
};

export default authConfig;
