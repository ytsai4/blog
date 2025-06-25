declare const process: {
    env: {
        PORT: string;
        NODE_ENV: string;

        PROJECT_NAME: string;

        SYS_TAG: string;
        SYS_NAME: string;
        SYS_URL: string;

        MARIADB_HOST: string;
        MARIADB_PORT: string;
        MARIADB_USERNAME: string;
        MARIADB_PASSWORD: string;
        MARIADB_DATABASE: string;

        JWT_SECRET: string;
        JWT_EXPIRES_IN: string;
        JWT_REFRESH_SECRET: string;
        JWT_REFRESH_EXPIRES_IN: string;

    };
};

export default (): Record<string, any> => ({
    Port: parseInt(process.env.PORT, 10) || 3000,
    NodeEnv: process.env.NODE_ENV,

    ProjectName: process.env.PROJECT_NAME || 'BASE',

    SYSTag: process.env.SYS_TAG || 'BASE',
    SYSName: process.env.SYS_NAME || 'BASE SYSTEM',
    SYSUrl: process.env.SYS_URL || 'localhost:3000',

    MARIADB: {
        Host: process.env.MARIADB_HOST || 'localhost',
        Port: parseInt(process.env.MARIADB_PORT, 10) || 3306,
        Username: process.env.MARIADB_USERNAME || 'root',
        Password: process.env.MARIADB_PASSWORD || '',
        Database: process.env.MARIADB_DATABASE || '',
    },
  
    JWT: {
        Secret: process.env.JWT_SECRET || 'secret',
        ExpiresIn: process.env.JWT_EXPIRES_IN || 1 * 60 * 60,
        RefreshSecret: process.env.JWT_REFRESH_SECRET || 'secret',
        RefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || 30 * 24 * 60 * 60,
    },

});