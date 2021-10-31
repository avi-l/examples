#!/bin/bash
#######################################
# Script run via gitlab-ci.yml
# which sets env specific configs
#######################################

############# SET A RANDOM ROUTE FOR BACKEND ################
echo "generating random string for backend route path"
export BE_PATH=`openssl rand -hex 6`

echo "Setting the backend route calls to /$BE_PATH for the $1 env"
sed -i "s/PATH_CHANGEME/$BE_PATH/g" ./ci_scripts/conf_files/nginx.conf
sed -i "s/SITE_CHANGEME/$1/g" ./ci_scripts/conf_files/nginx.conf

sed -i "s/PATH_CHANGEME/$BE_PATH/g" ./ci_scripts/conf_files/currentRoute.js
sed -i "s/SITE_CHANGEME/$1/g" ./ci_scripts/conf_files/currentRoute.js
mv ./ci_scripts/conf_files/currentRoute.js ./src/currentRoute.js

############## COPY SITE SPECIFIC COGINTO CREDENTIALS FILE INTO PLACE ############
if [ $1 = dev ]
then
    echo "REACT_APP_AWS_USER_POOL_ID=$DEV_USER_POOL_ID
          REACT_APP_AWS_CLIENT_ID=$DEV_USER_POOL_CLIENT_ID
          REACT_APP_AWS_POOL_REGION=us-east-1" > .env

else
    echo "REACT_APP_AWS_USER_POOL_ID=$DEMO_USER_POOL_ID
          REACT_APP_AWS_CLIENT_ID=$DEMO_USER_POOL_CLIENT_ID
          REACT_APP_AWS_POOL_REGION=us-east-1" > .env
fi
mv ./ci_scripts/conf_files/$1.cognitoConf.js ./src/components/user/cognitoConf.js
rm ./ci_scripts/conf_files/*.cognitoConf.js

echo "#######"
cat ./ci_scripts/conf_files/nginx.conf

echo "#######"
cat ./src/currentRoute.js