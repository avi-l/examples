import React, { useContext, useState } from 'react';
import { newPassRequired } from '../userManagement';
import { forceReload } from '../../../utilities/forceReload';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

const PassResetForm = observer(() => {
    const store = useContext(storeContext);
    const { loginStore, userStore } = store;
    const { password, setPassword,
        passwordCopy, setPasswordCopy } = loginStore;
    const { userObject } = userStore;
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            const res = await newPassRequired(userObject, password)
            if (res.message) {
                setIsLoading(false);
                return toast.warning(res.message);;
            }
            return forceReload('/userCheck');
        } catch (error) {
            setIsLoading(false);
            return toast.error(`Error: ${error.message}`)
        }
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
            <Form.Group className='input-group'>
                <Button block
                    className='submit'
                    type='submit'
                    disabled={isLoading || password === '' || password !== passwordCopy}
                >
                    {isLoading
                        ? <> Submitting... &nbsp;
                            <i className='fas fa-spinner fa-pulse'></i> </>
                        : <><i className='fas fa-user-plus' /> Confirm</>
                    }
                </Button>
            </Form.Group>
        </Form>
    );
});

export default PassResetForm;