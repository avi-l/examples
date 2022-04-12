import axios from 'axios';
import { currentRoute } from '../../currentRoute';

export const sendInvite = async (email, hashedPass) => {
    const url = `https://dev.REPLACE_HOSTNAME.social/signIn?contributorEmail=${email}&contributorCode=`;
    const subject = 'REPLACE_HOSTNAME Contributor Invitation';
    const text = `You have been invited to become a REPLACE_HOSTNAME.social contributor.
    Being a contributor will allow you to upload videos and to take full advantage of the all the features
    our site has to offer.
    In order to sign up, please paste the url below into your browser to sign in as a contributor.
    Signup is free, and will take only a moment.
    Looking forward to seeing you,
    REPLACE_HOSTNAME Team
        ${url}`;
    const html = `<p>Hi there.</br>
                    You have been invited to become a REPLACE_HOSTNAME.Social contributor!</br>
                    Being a contributor will allow you to upload videos and to take full advantage of the all the features 
                    our site has to offer.</br>
                    In order to sign up, please paste the url below into your browser to sign in as a contributor.</br>
                    Signup is free, and will take only a moment.</br>
                    We hope you still have your passphrase handy, as it will be required in order to sign up with this invitation.</br>
                    If you can't remember your passphrase, please reach out to the person who invited you to become a contributor.
                    Looking forward to seeing you,</br>
                 REPLACE_HOSTNAME Team</p></br>
                      ${url}`;
    axios.post(currentRoute + '/contributor/sendInvite',
        { email, subject, text, html, hashedPass }
    ).then(() => {
        console.log('Invite sent')
    }).catch((err) => {
        console.error(err);
    });
};
