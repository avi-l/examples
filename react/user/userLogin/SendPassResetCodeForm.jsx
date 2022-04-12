import React, { useContext, useState } from 'react';
import { resendVerificationEmail, sendResetCode } from '../userManagement';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import ConfirmCancelModal from '../../../utilities/ConfirmCancelModal';
import GenericModal from '../../shared/GenericModal';

const SendPassResetCodeForm = observer(() => {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirmCancelModal, setShowConfirmCancelModal] = useState({ show: false, message: '', action: '' })
    const [showErrorPopup, setShowErrorPopup] = useState({ show: false, message: '' })
    const store = useContext(storeContext);
    const { loginStore } = store;
    const { username, setUsername, setEmail,
        setIsForgotPassForm, setIsSendPassResetCodeForm, setIsVerifyCodeForm
    } = loginStore;

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
    const displayModals = () => {
        return (
            <>
                {showConfirmCancelModal.show &&
                    <ConfirmCancelModal
                        show={true}
                        message={showConfirmCancelModal.message}
                        action={showConfirmCancelModal.action}
                        close={() => setShowConfirmCancelModal({ show: false, message: '', action: '' })}
                    />}
                {showErrorPopup.show &&
                    <GenericModal
                        show={true}
                        title={'Request Error'}
                        body={showErrorPopup.message}
                        close={() => setShowErrorPopup({ show: false, message: '' })}
                    />}
            </>
        )
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
            setShowConfirmCancelModal({
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
            setShowErrorPopup({ show: true, message: res.message });
            setIsLoading(false)
            return
        }
    }

    return (
        <>
            {displayModals()}
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
                <Form.Group className='login-input-group'>
                    <Button block
                        className='submit'
                        type='submit'
                        disabled={!username || isLoading}
                    >
                        {isLoading
                            ? <> Sending... {'   '} <i className='fas fa-spinner fa-pulse'></i> </>
                            : <><i className='far fa-paper-plane' />{'  '} Send Reset Code</>
                        }
                    </Button>
                </Form.Group>
            </Form>
        </>
    );
});

export default SendPassResetCodeForm;