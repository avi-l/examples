import React, { useContext, useEffect, useState } from 'react'
import storeContext from "../../../stores/storeContext";
import { observer } from 'mobx-react';
import './Profile.css'
import ProfileDisplay from './ProfileDisplay';
import Loading from '../../shared/Loading';
import { setUserProfileData } from '../userManagement';
import { toast } from 'react-toastify';
import { forceReload } from '../../../utilities/forceReload';
import { useParams } from 'react-router-dom';

const Profile = observer(() => {
  const [isLoading, setIsLoading] = useState(true)
  const { profileId } = useParams();
  const store = useContext(storeContext);
  const { userStore } = store;
  const { user, profileUser, setProfileUser } = userStore;
  const toastOptions = { autoClose: 2500, pauseOnHover: true, onClose: () => forceReload("/") }

  useEffect(() => {
    setProfileUser(profileId ? { userId: profileId } : { userId: user.userId })
    if (profileUser.userId) {
      setUserProfileData(profileUser, setProfileUser)
        .then((res) => {
          if (!res) {
            return toast.error(`User Not Found`, toastOptions)
          }
          else if (res.error) {
            return toast.error(`${res.error}: Unable to reach database`, toastOptions)
          }
          setIsLoading(false)
        })
        .catch((err) => {
          toast.error(`${err}: Unable to reach database`, toastOptions)
        })
    }
  }, [profileUser.userId, user.userId])

  if (isLoading) {
    return (
      <div className="profile-loading"><Loading /></div>
    )
  }
  return (
    <ProfileDisplay loggedInUserId={user.userId} />
  )
});
export default Profile;