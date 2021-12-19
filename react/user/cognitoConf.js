export const awsconfig = {
    Auth: {
        region: process.env.REACT_APP_AWS_POOL_REGION,
        userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_AWS_CLIENT_ID,
        authenticationFlowType: 'USER_SRP_AUTH',
        mandatorySignIn: true,
        oauth: {
            domain: 'dev01-REPLACE_HOSTNAME-social.auth.us-east-1.amazoncognito.com',
            redirectSignIn: 'http://localhost:3010/userCheck/',
            redirectSignOut: 'http://localhost:3010/',
            responseType: 'code',
        },
    },
    API: {
        endpoints: [
            {
                name: 'DEV01-USER-POOL',
                endpoint: 'https://dev01-REPLACE_HOSTNAME-social.auth.us-east-1.amazoncognito.com'
            },
        ]
    }
};