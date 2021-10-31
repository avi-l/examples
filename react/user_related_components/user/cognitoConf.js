export const awsconfig = {
    Auth: {
        region: process.env.REACT_APP_AWS_POOL_REGION,
        userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_AWS_CLIENT_ID,
        authenticationFlowType: 'USER_SRP_AUTH',
        mandatorySignIn: true,
        oauth: {
            domain: 'FILL_IN_THE_BLANK',
            redirectSignIn: 'FILL_IN_THE_BLANK',
            redirectSignOut: 'FILL_IN_THE_BLANK',
            responseType: 'code',
        },
    },
    API: {
        endpoints: [
            {
                name: 'FILL_IN_THE_BLANK',
                endpoint: 'FILL_IN_THE_BLANK'
            },
        ]
    }
};