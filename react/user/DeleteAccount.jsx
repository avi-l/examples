import React, { useState, useEffect } from 'react';
import DeleteAccountForm from './DeleteAccountForm';
import { isUserLoggedIn, onAuthError } from './userManagement';
import Loading from '../shared/Loading';

const DeleteAccount = () => {
    const [isLoading, setIsLoading] = useState(true)
    useEffect(() => {
        (async () => {
            const res = await isUserLoggedIn(false)
            if (!res.attributes?.sub) return onAuthError(); 
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
        <div id='delete-account' style={{ marginTop: '150px' }}>
            <DeleteAccountForm />
        </div>
    );
};

export default DeleteAccount;