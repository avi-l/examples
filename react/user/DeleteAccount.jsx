import React, { useState, useEffect } from 'react';
import DeleteAccountForm from './DeleteAccountForm';
import { isUserLoggedIn, onAuthError } from './userManagement';
import { LoadingIcon } from '../shared/Loaders';

const DeleteAccount = () => {
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        (async () => {
            const res = await isUserLoggedIn(true)
            if (!res.attributes?.sub) return onAuthError(); 
            setIsLoading(false)
        })()
    }, [])

    if (isLoading) {
        return (
            <div style={{ position: 'relative', marginTop: '150px', marginLeft: '50%', marginRight: '-50%' }}>
                <LoadingIcon />
            </div>
        )
    }
    
    return (
        <div id='delete-account'>
            <DeleteAccountForm />
        </div>
    );
};

export default DeleteAccount;
