export const poolData  = {
    UserPoolId: 'FILL_IN_THE_BLANK',
    ClientId: 'FILL_IN_THE_BLANK',
};

export const pool_region = "FILL_IN_THE_BLANK";

export const awsconfig = {
    Auth: {
        region: pool_region,
        userPoolId: poolData.UserPoolId,
        userPoolWebClientId: poolData.ClientId,
        authenticationFlowType: 'USER_SRP_AUTH',
        mandatorySignIn: true,
        oauth: {
            domain: 'FILL_IN_THE_BLANK.amazoncognito.com',
            redirectSignIn: 'https://FILL_IN_THE_BLANK',
            redirectSignOut: 'https://FILL_IN_THE_BLANK',
            responseType: 'code',
        },
    },
    API: {
        endpoints: [
            {
                name: "DEMO-USER-POOL",
                endpoint: "https://FILL_IN_THE_BLANK.amazoncognito.com"
            },
        ]
    }
};
