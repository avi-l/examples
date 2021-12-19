import React, { useState } from 'react';
import './SUDashboard.css';
import { sendInvite } from './sendInvite';
import Form from 'react-bootstrap/Form';
import isEmail from 'validator/lib/isEmail';
import isAlpha from 'validator/lib/isAlpha';
import Button from 'react-bootstrap/Button';
import bcrypt from 'bcryptjs'

const SUDashboard = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message1, setMessage1] = useState('');
    const [message2, setMessage2] = useState('');
    const [message3, setMessage3] = useState('');

    const handleEmail = e => {
        setEmail(e.target.value);
        setMessage2('');
    };
    const handlePass = (e) => {
        setPassword(e.target.value)
        setMessage3('')
    }

    const submitInvite = async () => {
        if (!isEmail(email)) {
            setMessage2('Not a valid email address')
            return null
        }
        if (!isAlpha(password)) {
            setMessage3('Letters only please')
            return null
        }
        const salt = bcrypt.genSaltSync(10)
        const hashedPass = bcrypt.hashSync(password.toLowerCase(), salt)
        await sendInvite(email, hashedPass);
        setMessage1('Invitation sent');
        setTimeout(() => { 
            setMessage1('') 
            setEmail('');
            setPassword('')
        }, 3000);
    };

    return (
        <div className={'su-dash'}>
            <h3>Invite user as contributor</h3>
            <Form>
                <Form.Group controlId='formBasicEmail'>
                    <Form.Label>Enter invitee's email address: <b className={'blink_me'}>{message2}</b></Form.Label>
                    <Form.Control type='email'
                        placeholder='Email'
                        value={email}
                        onChange={handleEmail} />
                </Form.Group>

                <Form.Group controlId='formBasicPassPhrase'>
                    <Form.Label>Enter a word to be used as Link Verification Password: <b className={'blink_me'}>{message3}</b></Form.Label>
                    <Form.Control type='text'
                        placeholder='Password'
                        value={password}
                        onChange={handlePass} />
                </Form.Group>
                <p className={'blink_me'}>{message1}</p>
                <Button variant='primary'
                    type='button'
                    onClick={submitInvite}>
                    Submit
                </Button>
            </Form>
        </div>
    );
};

export default SUDashboard;