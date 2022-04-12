#!/bin/bash
#######################################
# Script run via gitlab-ci.yml
# which sets env specific configs
#######################################

#### Set the backend URL based on site we are deploying
sed -i "s/SITE_CHANGEME/$1/g" ./ci_scripts/conf_files/nginx.conf
mv ./ci_scripts/conf_files/currentRoute.js ./src/currentRoute.js

### FOR NOW USING SAME USER POOL FOR DEMO AND DEV SITE
echo "REACT_APP_AWS_USER_POOL_ID=$DEV_USER_POOL_ID
      REACT_APP_AWS_CLIENT_ID=$DEV_USER_POOL_CLIENT_ID
      REACT_APP_AWS_POOL_REGION=us-east-1
      REACT_APP_AWS_OAUTH_DOMAIN='dev01-alpha-REPLACE_HOSTNAME-social.auth.us-east-1.amazoncognito.com'
      REACT_APP_AWS_AUTH_API_NAME='DEV01-ALPHA-USER-POOL'
      REACT_APP_AWS_AUTH_API_ENDPOINT='https://dev01-alpha-REPLACE_HOSTNAME-social.auth.us-east-1.amazoncognito.com'
      REACT_APP_BLANK_USER_AVATAR='/images/blank-profile-picture-973460_960_720.png'
      REACT_APP_BLANK_VIDEO_PIC='/images/color_static.jpg'
      REACT_APP_ERROR_PAGE_BG_IMG='/images/404_bg_01.png'
      REACT_APP_SIGNIN_PAGE_BG_IMG='/images/login_bg_01.png'
      " > .env

############## SET SITE SPECIFIC COGINTO REDIRECTS  ############
if [ $1 = dev ]
then
    echo "REACT_APP_AWS_OAUTH_REDIRECT_SIGNIN='https://dev.REPLACE_HOSTNAME.social/userCheck/'
          REACT_APP_AWS_OAUTH_REDIRECT_SIGNOUT='https://dev.REPLACE_HOSTNAME.social/'
          " >> .env

else
    echo "REACT_APP_AWS_OAUTH_REDIRECT_SIGNIN='https://demo.REPLACE_HOSTNAME.social/userCheck/'
          REACT_APP_AWS_OAUTH_REDIRECT_SIGNOUT='https://demo.REPLACE_HOSTNAME.social/'
          " >> .env
fi

