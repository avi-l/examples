export const awsconfig = {
    Auth: {
        region: process.env.REACT_APP_AWS_POOL_REGION,
        userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_AWS_CLIENT_ID,
        authenticationFlowType: 'USER_SRP_AUTH',
        mandatorySignIn: true,
        oauth: {
            domain: 'demo-lamplighter-social.auth.us-east-1.amazoncognito.com',
            redirectSignIn: 'https://demo.lamplighter.social/userCheck/',
            redirectSignOut: 'https://demo.lamplighter.social/',
            responseType: 'code',
        },
    },
    API: {
        endpoints: [
            {
                name: 'DEMO-USER-POOL',
                endpoint: 'https://demo-lamplighter-social.auth.us-east-1.amazoncognito.com'
            },
        ]
    }
};
