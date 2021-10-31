import React, {useState} from 'react';
import './SUDashboard.css';
import {sendInvite} from './sendInvite';
import Form from 'react-bootstrap/Form';
import isEmail from 'validator/lib/isEmail';
import Button from 'react-bootstrap/Button';

const SUDashboard = () => {
    const [email, setEmail] = useState('');
    const [message1, setMessage1] = useState('');
    const [message2, setMessage2] = useState('');

    const handleEmail = e => {
        setEmail(e.target.value);
        setMessage2('');
    };

    const submitInvite = async () => {
        if (!isEmail(email)) {
            setMessage2('Not a valid email address')
            return null
        }
        await sendInvite(email);
        await setMessage1('Invitation sent');
        await setEmail('');
        await setTimeout(() => {setMessage1('')}, 3000);
    };

    return (
        <div className={'su-dash'}>
            <h3>Invite user as contributor</h3>
            <Form>
                <Form.Group controlId='formBasicEmail'>
                    <Form.Label>Enter invitee's email address</Form.Label>
                    <Form.Control type='email'
                                  placeholder='Email'
                                  onChange={handleEmail}/>
                </Form.Group>
                <p className={'blink_me'}>{message1}</p>
                <p>{message2}</p>
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