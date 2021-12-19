import React, { useContext, useState } from 'react';
import { resendVerificationEmail, sendResetCode } from '../userManagement';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const SendPassResetCodeForm = observer(() => {
    const [isLoading, setIsLoading] = useState(false);
    const store = useContext(storeContext);
    const { modalStore, loginStore } = store;
    const { username, setUsername, setEmail,
        setIsForgotPassForm, setIsSendPassResetCodeForm, setIsVerifyCodeForm
    } = loginStore;
    const { setShowErrorPopup, setShowConfirmCancelPopup } = modalStore;

    const sendCodeToUser = async () => {
        try {
            const res = sendResetCode(username)
            return res;
        } catch (error) {
            return error
        }
    }
    const verifyEmailAddress = async () => {
        await resendVerificationEmail(username)
        setIsSendPassResetCodeForm(false)
        setIsVerifyCodeForm(true)
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const res = await sendCodeToUser()
        if (!!res.CodeDeliveryDetails?.Destination) {
            setEmail(res.CodeDeliveryDetails.Destination);
            setIsSendPassResetCodeForm(false);
            setIsForgotPassForm(true);
            setIsLoading(false)
            return
        }
        else if (res.message?.includes('verified')) {
            setShowConfirmCancelPopup({
                show: true,
                message: `Your email is not verified. Only accounts with a verified email ` +
                    `address are allowed to reset their password. ` +
                    `Click Confirm to send a new verification code to your email`,
                action: verifyEmailAddress
            })
            setIsLoading(false)
            return
        }
        else {
            setShowErrorPopup(
                {
                    show: true,
                    message: `There was a problem with your request: ${res?.message}`,
                    tryAgain: true
                });
            setIsLoading(false)
            return
        }
    }

    return (
        <Form className='form-signin' onSubmit={handleSubmit}>
            <Form.Label>
                Forgot Password? Enter your username and we will send a password reset
                code to your email
            </Form.Label>
            <Form.Group className='input-group'>
                <Form.Control
                    type='code'
                    id='inputUsername'
                    className='form-control'
                    placeholder='Username'
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)}
                    required
                    autoFocus
                />
            </Form.Group>
            <Form.Group className='input-group'>
                <Button
                    className='btn form-control submit'
                    type='submit'
                    disabled={!username||isLoading}
                >
                    {isLoading
                        ? <> Sending... {'   '} <i className='fas fa-spinner fa-pulse'></i> </>
                        : <><i className='far fa-paper-plane' />{'  '} Send Reset Code</>
                    }
                </Button>
            </Form.Group>
        </Form>
    );
});

export default SendPassResetCodeForm;