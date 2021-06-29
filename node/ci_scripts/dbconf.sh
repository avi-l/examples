#!/bin/bash

echo "module.exports = {
  remoteDB: 'mongodb+srv://$DB_CONNECT_STRING?retryWrites=true&w=majority',
  remoteUser: '$DB_USER',
  remotePass: '$DB_PASSWD',
};" > DbCredentials.js

echo "module.exports = {
    ACCT_SID: '$TWILIO_SID',
    ACCT_TOKEN: '$TWILIO_AUTH_TOKEN'
}" > twilioCredentials.js

echo "module.exports = {
    pass: '$MAILER_PASS',
};" > mailerCredentials.js

echo "module.exports = {
    CLOUDKARAFKA_TOPIC_PREFIX: 'fylua7c9-',
    CLOUDKARAFKA_BROKERS: 'rocket-01.srvs.cloudkafka.com:9094,rocket-02.srvs.cloudkafka.com:9094,rocket-03.srvs.cloudkafka.com:9094',
    CLOUDKARAFKA_USERNAME: '$DEV_KARAFKA_USERNAME',
    CLOUDKARAFKA_PASSWORD: '$DEV_KARAFKA_PASSWORD',
};" > kafkaCredentials.js

echo "module.exports = {
    cloud_name: '$CLOUDINARY_CLOUDNAME',
    api_key: '$CLOUDINARY_API_KEY',
    api_secret: '$CLOUDINARY_API_SECRET'
};" > cloudinaryCredentials.js

echo "module.exports = {
   ACCESS_TOKEN: '$VIMEO_ACCESS_TOKEN'
};" > vimeoCredentials.js