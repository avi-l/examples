#!/bin/bash
#######################################
# Script run via gitlab-ci.yml
# which sets env specific configs
#######################################

############# SET THE BACKEND URL IN NGINX CONF #############
echo "Setting backend URL for the $1 environment"
sed -i "s/SITE_CHANGEME/$1/g" ./ci_scripts/conf_files/nginx.conf

############# SET A RANDOM ROUTE FOR BACKEND ################
echo "generating random string for backend route path"
export BE_PATH=`openssl rand -hex 6`

echo "Setting the path for the backend route calls to /$BE_PATH"
sed -i "s/PATH_CHANGEME/$BE_PATH/g" ./ci_scripts/conf_files/nginx.conf

echo "Update the route variable in currentRoute.js to /$BE_PATH"
sed -i "s/PATH_CHANGEME/$BE_PATH/g" ./ci_scripts/conf_files/currentRoute.js
mv ./ci_scripts/conf_files/currentRoute.js ./src/currentRoute.js

############## SET THE VIMEO ACCESS TOKEN ####################
echo "export const accessToken = '$VIMEO_ACCESS_TOKEN';" > ./src/components/channel/vimeoCredentials.js

############## COPY SITE SPECIFIC COGINTO CREDENTIALS FILE INTO PLACE ############
mv ./ci_scripts/conf_files/$1.cognitoCredentials.js ./src/components/user/cognitoCredentials.js
rm ./ci_scripts/conf_files/*.cognitoCredentials.js

echo "#######"
cat ./ci_scripts/conf_files/nginx.conf

echo "#######"
cat ./src/currentRoute.js

echo "#######"
cat ./src/components/user/cognitoCredentials.js

echo "#######"
cat ./src/components/channel/vimeoCredentials.js
