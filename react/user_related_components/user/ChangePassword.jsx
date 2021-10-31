import React, { useContext, useState } from 'react';
import ErrorsModal from './shared/ErrorsModal';
import storeContext from '../../stores/storeContext';
import { observer } from 'mobx-react';
import ChangePasswordForm from './ChangePasswordForm';
import { isUserLoggedIn } from './userManagement';
import Loading from '../shared/Loading';
import { toast } from 'react-toastify';
import { forceReload } from '../../utilities/forceReload';

const ChangePassword = observer(() => {
    const [isLoading, setIsLoading] = useState(true)
    const store = useContext(storeContext);
    const { userStore, modalStore } = store;
    const { user } = userStore;
    const { setShowErrorPopup } = modalStore;
    const MESSAGES = {
        socialIdp: `You're logged in using ${user?.authProvider}. We do not maintain your ${user?.authProvider} password. 
        If you want to change your password, please do so via your ${user?.authProvider} account`,
        notLoggedIn: `Please log in to change your password`,
    }

    setTimeout(() => {
        isUserLoggedIn(false)
          .then(() => setIsLoading(false))
          .catch((err) => {
            toast.error(MESSAGES.notLoggedIn,
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
                <ErrorsModal />
            </div>
        )
    }

    return (
        <div id='change-password'>
            {user?.userHandle !== 'Guest' &&
                user?.authProvider === 'Cognito' && <ChangePasswordForm />}
            {(user?.authProvider === 'Facebook' ||
                user?.authProvider === 'Google') &&
                setShowErrorPopup({ show: true, message: MESSAGES.socialIdp, tryAgain: false })
            }
            <ErrorsModal />
        </div>
    );
});

export default ChangePassword;