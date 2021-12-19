import React, { useContext, useEffect, useState } from 'react'
import storeContext from '../../../stores/storeContext';
import Button from 'react-bootstrap/Button';
import { observer } from 'mobx-react';
import './Profile.css'
import { setUserProfileData } from '../userManagement';
import { forceReload } from '../../../utilities/forceReload';
import UploadPicModal from '../../shared/UploadPicModal';
import EditProfileModal from './EditProfileModal';
import DisplayUserComments from './DisplayUserComments';
import DisplayUserReps from './DisplayUserReputations';
import SearchUsers from '../SearchUsers';
import { Col, Image, ListGroup, Row } from 'react-bootstrap';
import { followUnfollowUser, updateUserDetails } from '../user_api';
import FollowersModal from './FollowersModal';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loading from '../../shared/Loading';

const ProfileDisplay = observer((props) => {
  const [isLoading, setIsLoading] = useState(true)
  const { profileUserId } = props;
  const store = useContext(storeContext);
  const { modalStore, userStore } = store;
  const { profileUser, setProfileUser, user } = userStore;
  const { setShowUploadPicModal, setShowEditProfileModal,
    setShowFollowersModal, setShowErrorPopup } = modalStore;
  const history = useHistory();
  const blankAvatar = '/images/blank-profile-picture-973460_960_720.png';

  useEffect(() => {
    (async () => {
      const fetchUserId = profileUserId ? profileUserId : user.userId
      const isFullDetails = profileUserId !== user.userId
      const toastOptions = { autoClose: 2500, position: 'top-center', onClose: () => forceReload('/') }
      if (fetchUserId) {
        try {
          const res = await setUserProfileData(fetchUserId, setProfileUser, isFullDetails)
          if (!res) return toast.error(`User Not Found`, toastOptions)
          else setIsLoading(false)
        } catch (error) {
          toast.error(`Unable to reach backend ${error}`, { position: 'top-center' })
        }
      }
    })();
  }, [profileUserId, setProfileUser, user.userId])

  if (isLoading) return (<div className='profile-loading'><Loading /></div>)

  const onError = (res) => {
    setShowErrorPopup({ show: true, message: `Error: ${res.statusText}`, tryAgain: true })
  }

  const followUnfollow = async (route) => {
    const followee = { userId: profileUser.userId }
    const follower = { userId: user.userId }
    let newFollowersArr;
    try {
      const res = await followUnfollowUser(route, { followee, follower })
      if (res.status !== 200) {
        onError(res)
        return
      }
      if (route === '/users/follow') {
        newFollowersArr = [...profileUser.followers]
        newFollowersArr.splice(0, 0, follower)
      }
      else {
        newFollowersArr = profileUser.followers.filter((val) => val.userId !== user.userId)
      }
      setProfileUser({ ...profileUser, followers: newFollowersArr })
    } catch (error) {
      toast.error(`Unable to reach backend ${error}`, { position: 'top-center' })
    }
  }

  const updateAvatarUrl = async (val) => {
    try {
      const res = await updateUserDetails({ userId: profileUser.userId, avatar: val })
      if (res.status !== 200) {
        onError(res)
        return
      }
      setProfileUser({ ...profileUser, avatar: val })
      setShowUploadPicModal({ show: false, folder: '', action: '' });
    } catch (error) {
      onError(error)
    }
  }

  const displayAvatar = () => {
    return (
      <>
        <Image roundedCircle
          src={profileUser?.avatar || blankAvatar}
          alt={profileUser?.userHandle} className='profile-avatar'
        />
        {profileUser?.userId === user.userId &&
          <i className='material-icons profile-clickable-icon'
            title='Upload Profile Pic'
            onClick={() => {
              setShowUploadPicModal({ show: true, folder: 'avatars', action: updateAvatarUrl })
            }}>add_a_photo</i>
        }
      </>
    )
  }

  const displayFollowTabs = () => {
    return (
      <ListGroup horizontal>
        <ListGroup.Item className='profile-followers'
          onClick={() => setShowFollowersModal({ show: true, user: profileUser, loggedInUserId: user.userId, showType: 'followers' })}
        > Followers: {profileUser?.followers?.length}</ListGroup.Item>
        <ListGroup.Item className='profile-followers'
          onClick={() => setShowFollowersModal({ show: true, user: profileUser, loggedInUserId: user.userId, showType: 'following' })}
        > Following: {profileUser?.following?.length}</ListGroup.Item>
      </ListGroup>
    )
  }

  const displayFollowBtns = () => {
    if (profileUser?.userId !== user.userId) {
      return (
        <>
          <Row >
            <Col className='profile-follow-chat-btns'>{profileUser?.followers?.find(val => val.userId === user.userId)
              ? <Button variant='outline-primary'
                onClick={() => followUnfollow('/users/unfollow')}>Unfollow</Button>
              : <Button variant='outline-primary'
                onClick={() => followUnfollow('/users/follow')}>Follow</Button>
            }
            </Col>
            <Col className='profile-follow-chat-btns'>
              <Button variant='outline-primary'
                onClick={() => history.push('/chat/?_id=' + profileUser?.userId)}
              >Message</Button>
            </Col>
          </Row>
        </>
      )
    }
    else {
      return (
        <>
          <Row >
            <Col className='profile-edit-btn'>
              <Button variant='outline-primary'
                onClick={() => { setShowEditProfileModal(true) }}>Edit Profile</Button>
            </Col>
          </Row>
        </>
      )
    }
  }

  return (
    <>
      <div className='profile-container'>
        <div className='profile-main-body'>
          <div className='row profile-gutters-sm'>
            <div className='col-md-4 profile-mb-3'>
              <div className='profile-card'>
                <div className='profile-card-body'>
                  <div className='d-flex flex-column align-items-center text-center profile-avatar-card'>
                    <>{displayAvatar()}</>
                    <h5 className='mt-3 '>{profileUser?.userHandle}</h5>
                    <>{displayFollowTabs()}</>
                    <br />
                    <>{displayFollowBtns()}</>
                  </div>
                </div>
              </div>
              {profileUser?.userId === user.userId &&
                <div className='profile-card mt-3 profile-search-users'>
                  <SearchUsers />
                </div>
              }
            </div>
            <div className='col-md-8'>
              <div className='profile-card profile-mb-3'>
                <div className='profile-card-body'>
                  <div className='row'>
                    <div className='col-sm-3'>
                      <h6 className='profile-mb-0'>Name</h6>
                    </div>
                    <div className='col-sm-9 text-secondary'>
                      {profileUser?.firstName} {profileUser?.lastName}
                    </div>
                  </div>
                  {profileUser?.userId === user.userId &&
                    <>
                      <hr />
                      <div className='row'>
                        <div className='col-sm-3'>
                          <h6 className='profile-mb-0'>Email</h6>
                        </div>
                        <div className='col-sm-9 text-secondary'>
                          {profileUser?.email}
                        </div>
                      </div>
                      <hr />
                      <div className='row'>
                        <div className='col-sm-3'>
                          <h6 className='profile-mb-0'>Phone: </h6>
                        </div>
                        <div className='col-sm-9 text-secondary'>
                          {profileUser?.mobilePhone && profileUser?.mobilePhone !== 'false' ? profileUser?.mobilePhone : '###-###-####'} &nbsp;
                        </div>
                      </div><hr />
                      <div className='row'>
                        <div className='col-sm-3'>
                          <h6 className='profile-mb-0'>Address</h6>
                        </div>
                        <div className='col-sm-9 text-secondary'>
                          {profileUser?.address && Object.values(profileUser?.address).map((val, key) => (<span key={key}>{val} </span>))}
                        </div>
                      </div>
                    </>
                  }
                </div>
              </div>
              <div className='row profile-gutters-sm'>
                <div className='col-sm-6 profile-mb-3'>
                  <div className='profile-card profile-h-100'>
                    <div className='profile-card-body'>
                      {/* <h6 className='d-flex align-items-center profile-mb-3'><i className='material-icons text-info mr-2'>subscriptions</i>{profileUser?.isContributor ? 'Channels' : 'Subscriptions'}</h6> */}

                      <DisplayUserReps userId={profileUser?.userId} userHandle={profileUser?.userHandle} />
                    </div>
                  </div>
                </div>
                <div className='col-sm-6 profile-mb-3'>
                  <div className='profile-card profile-h-100'>
                    <div className='profile-card-body'>
                      <DisplayUserComments userId={profileUser?.userId} userHandle={profileUser?.userHandle} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UploadPicModal />
      <EditProfileModal />
      <FollowersModal />
    </>
  )
})
export default ProfileDisplay;