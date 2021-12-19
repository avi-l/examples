import React, { useContext, useState } from 'react';
import { newPassRequired } from '../userManagement';
import { forceReload } from '../../../utilities/forceReload';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import PasswordChecklist from 'react-password-checklist'

const PassResetForm = observer(() => {
    const store = useContext(storeContext);
    const { modalStore, loginStore, userStore } = store;
    const { password, setPassword,
        passwordCopy, setPasswordCopy } = loginStore;
    const { userObject } = userStore;
    const { setShowErrorPopup } = modalStore;
    const [isLoading, setIsLoading] = useState(false);

    const submitNewPassRequired = async () => {
        try {
            const res = await newPassRequired(userObject, password)
            return res
        } catch (error) {
            return error;
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        console.log(userObject)
        const res = await submitNewPassRequired()
        console.log(res)
        if (res.message) {
            setShowErrorPopup({ show: true, message: res.message, tryAgain: true });
            setIsLoading(false);
            return;
        }
        return forceReload('/userCheck');
    };

    return (
        <Form className='form-signin' onSubmit={handleSubmit}>
            <p> It looks like you need to change your password.</p>
            <Form.Group className='input-group'>
                <Form.Control
                    type='password'
                    id='inputPassword'
                    className='form-control'
                    placeholder='Password'
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)}
                    required
                />
            </Form.Group>
            <Form.Group className='input-group' >
                <Form.Control
                    type='password'
                    id='passwordCopy'
                    className='form-control'
                    placeholder='Confirm Password'
                    onChange={(e) =>
                        setPasswordCopy(e.target.value)}
                    value={passwordCopy}
                    required
                />
            </Form.Group>
            {password !== '' &&
                <Form.Group className='password-validator'>
                    <PasswordChecklist
                        rules={['length', 'specialChar', 'number', 'capital', 'match']}
                        minLength={8}
                        value={password}
                        valueAgain={passwordCopy}
                    />
                </Form.Group>}
            <Form.Group className='input-group'>
                {!isLoading &&
                    <Button
                        className='btn form-control submit'
                        type='submit'
                    >
                        <i className='fas fa-user-plus' /> Confirm
                    </Button>}
            </Form.Group>
            <Form.Group>
                {isLoading &&
                    <Button
                        className='btn form-control submit'
                        type='button'
                        id='btn-signup'
                    >
                        Submitting... &nbsp;
                        <i className='fas fa-spinner fa-pulse'></i>
                    </Button>
                }
            </Form.Group>
        </Form>
    );
});

export default PassResetForm;