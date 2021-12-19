import React, { useState, useEffect } from 'react';
import ChangePasswordForm from './ChangePasswordForm';
import { isUserLoggedIn, onAuthError } from './userManagement';
import Loading from '../shared/Loading';
import ErrorsModal from './shared/ErrorsModal';

const ChangePassword = () => {
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        (async () => {
            const res = await isUserLoggedIn(false)
            if (!res.attributes?.sub) return onAuthError()
            setIsLoading(false)
        })()
    }, [])

    if (isLoading) {
        return (
            <div style={{ position: 'relative', marginTop: '150px', marginLeft: '50%', marginRight: '-50%' }}>
                <Loading />
            </div>
        )
    }   
    return (
        <div className='changePassword'>
            <ChangePasswordForm />
            <ErrorsModal />
        </div>
    );
};

export default ChangePassword;