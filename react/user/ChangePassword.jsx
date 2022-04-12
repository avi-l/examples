import React, { useState, useEffect } from 'react';
import ChangePasswordForm from './ChangePasswordForm';
import { isUserLoggedIn, onAuthError } from './userManagement';
import { LoadingIcon, TaskList } from '../shared/Loaders';

const ChangePassword = () => {
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        (async () => {
            const res = await isUserLoggedIn(true)
            if (!res.attributes?.sub) return onAuthError()
            setIsLoading(false)
        })()
    }, [])

    if (isLoading) {
        return (
            <div>
                <TaskList />
                {/* <LoadingIcon /> */}
            </div>
        )
    }   
    return (
        <div className='changePassword'>
            <ChangePasswordForm />
        </div>
    );
};

export default ChangePassword;