import React, { useState } from 'react';
import DeleteAccountForm from './DeleteAccountForm';
import { isUserLoggedIn } from './userManagement';
import Loading from '../shared/Loading';
import { toast } from 'react-toastify';
import { forceReload } from '../../utilities/forceReload';

const DeleteAccount = () => {
    const [isLoading, setIsLoading] = useState(true)

    setTimeout(() => {
        isUserLoggedIn(false)
          .then(() => setIsLoading(false))
          .catch((err) => {
            toast.error(`Please sign in to use this feature`,
              {
                toastId: 'preventDuplicate', 
                position: 'top-center',
                onClose: () => forceReload('/signIn')
              })
          });
      }, 1000)

    if (isLoading) {
        return (
            <div style={{ position: 'relative',marginTop: '150px', marginLeft: '50%', marginRight: '-50%'}}>
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