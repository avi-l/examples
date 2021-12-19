export const awsconfig = {
    Auth: {
        region: process.env.REACT_APP_AWS_POOL_REGION,
        userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_AWS_CLIENT_ID,
        authenticationFlowType: 'USER_SRP_AUTH',
        mandatorySignIn: true,
        oauth: {
            domain: '',
            redirectSignIn: '',
            redirectSignOut: '',
            responseType: 'code',
        },
    },
    API: {
        endpoints: [
            {
                name: '',
                endpoint: ''
            },
        ]
    }
};
