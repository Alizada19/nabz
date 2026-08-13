declare const _default: () => {
    nodeEnv: string;
    port: number;
    appUrl: string;
    database: {
        url: string | undefined;
    };
    jwt: {
        secret: string | undefined;
        expiresIn: string;
        refreshSecret: string | undefined;
        refreshExpiresIn: string;
    };
    fcm: {
        serverKey: string | undefined;
    };
    matching: {
        defaultRadiusKm: number;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
};
export default _default;
