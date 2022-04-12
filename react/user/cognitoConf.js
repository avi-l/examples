export const awsconfig = {
    Auth: {
        region: process.env.REACT_APP_AWS_POOL_REGION,
        userPoolId: process.env.REACT_APP_AWS_USER_POOL_ID,
        userPoolWebClientId: process.env.REACT_APP_AWS_CLIENT_ID,
        authenticationFlowType: 'USER_SRP_AUTH',
        mandatorySignIn: true,
        oauth: {
            domain: process.env.REACT_APP_AWS_OAUTH_DOMAIN,
            redirectSignIn: process.env.REACT_APP_AWS_OAUTH_REDIRECT_SIGNIN,
            redirectSignOut: process.env.REACT_APP_AWS_OAUTH_REDIRECT_SIGNOUT,
            responseType: 'code',
        },
    },
    API: {
        endpoints: [
            {
                name: process.env.REACT_APP_AWS_AUTH_API_NAME,
                endpoint: process.env.REACT_APP_AWS_AUTH_API_ENDPOINT
            },
        ]
    }
};