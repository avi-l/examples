import axios from 'axios';
import {currentRoute} from '../../currentRoute';

export const sendInvite = async (email) => {
    const url = `https://dev.example.com/contributorSignUp?contributorEmail=${email}&contributorCode=`;
    const subject = 'Contributor Invitation';
    const text=  `You have been invited to become a example.com contributor.
    Being a contributor will allow you to upload videos and to take full advantage of the all the features
    our site has to offer.
    In order to sign up, please paste the url below into your browser to sign in as a contributor.
    Signup is free, and will take only a moment.
    Looking forward to seeing you,
    Team
        ${url}`;
    const html = `<p>Hi, there.</br>
                    You have been invited to become a example.com contributor.</br>
                    Being a contributor will allow you to upload videos and to take full advantage of the all the features 
                    our site has to offer.</br>
                    In order to sign up, please paste the url below into your browser to sign in as a contributor.</br>
                    Signup is free, and will take only a moment.</br>
                    Looking forward to seeing you,</br>
                    Team</p></br>
                      ${url}`;
    axios.post(currentRoute + '/contributor/sendInvite',
        {email, subject, text, html}
        ).then(() => {
            console.log('Invite sent')
        }).catch((err) => {
           console.error(err);
        });
};
