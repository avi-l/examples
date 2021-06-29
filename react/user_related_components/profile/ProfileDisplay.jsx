import React, { useContext } from 'react'
import storeContext from "../../../stores/storeContext";
import Button from "react-bootstrap/Button";
import { observer } from 'mobx-react';
import './Profile.css'
import UploadPicModal from './UploadPicModal';
import EditProfileModal from './EditProfileModal';
import DisplayUserComments from './DisplayUserComments';
import DisplayUserReps from './DisplayUserReputations';
import SearchUsers from '../SearchUsers';
import { Image, ListGroup } from 'react-bootstrap';
import { followUnfollowUser } from '../user_api';
import FollowersModal from './FollowersModal';

const ProfileDisplay = observer((props) => {
  const { loggedInUserId } = props;
  const store = useContext(storeContext);
  const { modalStore, userStore } = store;
  const { profileUser, setProfileUser, user } = userStore;
  const { setShowUploadPicModal, setShowEditProfileModal,
    setShowFollowersModal } = modalStore;

  const followUnfollow = (route) => {
    followUnfollowUser(route,
      {
        followee: profileUser,
        follower: user
      })
      .then(() => {
        if (route === '/users/follow') {
          const newFollowersArr = [...profileUser.followers]
          newFollowersArr.splice(0, 0, {
            userId: user.userId,
            userHandle: user.userHandle,
            firstName: user.firstName,
            lastName: user.lastName,
            avatar: user.avatar
          })
          setProfileUser({ ...profileUser, followers: newFollowersArr })
        }
        else {
          const newFollowersArr = profileUser.followers.filter((val) => val.userId !== loggedInUserId)
          setProfileUser({ ...profileUser, followers: newFollowersArr })
        }
      })
      .catch(err => console.error(err))
  }

  return (
    <>
      <div className="profile-container">
        <div className="profile-main-body">
          <div className="row profile-gutters-sm">
            <div className="col-md-4 profile-mb-3">
              <div className="profile-card">
                <div className="profile-card-body">
                  <div className="d-flex flex-column align-items-center text-center">
                    <Image roundedCircle src={profileUser?.avatar}
                      alt={profileUser?.userHandle} className="profile-avatar"
                    />
                    {profileUser?.userId === loggedInUserId &&
                      <i className="material-icons profile-clickable-icon" title="Upload Profile Pic" onClick={() => {
                        setShowUploadPicModal(true)
                      }}>add_a_photo</i>}
                    <div className="mt-3">
                      <h5>{profileUser?.userHandle}</h5>
                      <ListGroup horizontal>
                        <ListGroup.Item className="profile-followers-hover"
                          onClick={() => setShowFollowersModal({ show: true, user: profileUser, showType: 'followers', action: followUnfollow() })}
                        > Followers: {profileUser?.followers?.length}</ListGroup.Item>
                        <ListGroup.Item className="profile-followers-hover"
                          onClick={() => setShowFollowersModal({ show: true, user: profileUser, showType: 'following', action: followUnfollow() })}
                        > Following: {profileUser?.following?.length}</ListGroup.Item>
                      </ListGroup>
                      <br />
                      {profileUser?.userId !== loggedInUserId &&
                        <>
                          {profileUser?.followers?.find(val => val.userId === loggedInUserId)
                            ? <Button variant="outline-primary"
                              onClick={() => followUnfollow('/users/unfollow')}>Unfollow</Button>
                            : <Button variant="outline-primary"
                              onClick={() => followUnfollow('/users/follow')}>Follow</Button>
                          }
                          <Button variant="outline-primary">Message</Button>
                        </>
                      }
                      {profileUser?.userId === loggedInUserId &&
                        <Button variant="outline-primary" onClick={() => {
                          setShowEditProfileModal(true)
                        }}>Edit Profile</Button>
                      }
                    </div>
                  </div>
                </div>
              </div>
              {profileUser?.userId === loggedInUserId &&
                <div className="profile-card mt-3">
                  <SearchUsers />
                </div>
              }
            </div>
            <div className="col-md-8">
              <div className="profile-card profile-mb-3">
                <div className="profile-card-body">
                  <div className="row">
                    <div className="col-sm-3">
                      <h6 className="profile-mb-0">Name</h6>
                    </div>
                    <div className="col-sm-9 text-secondary">
                      {profileUser?.firstName} {profileUser?.lastName}
                    </div>
                  </div>
                  <hr />
                  <div className="row">
                    <div className="col-sm-3">
                      <h6 className="profile-mb-0">Email</h6>
                    </div>
                    <div className="col-sm-9 text-secondary">
                      {profileUser?.email}
                    </div>
                  </div>
                  {profileUser?.userId === loggedInUserId &&
                    <>
                      <hr />
                      <div className="row">
                        <div className="col-sm-3">
                          <h6 className="profile-mb-0">Phone: </h6>
                        </div>
                        <div className="col-sm-9 text-secondary">
                          {profileUser?.mobilePhone && profileUser?.mobilePhone !== 'false' ? profileUser?.mobilePhone : "###-###-####"} &nbsp;
                        </div>
                      </div><hr />
                      <div className="row">
                        <div className="col-sm-3">
                          <h6 className="profile-mb-0">Address</h6>
                        </div>
                        <div className="col-sm-9 text-secondary">
                          {profileUser?.address && Object.values(profileUser?.address).map((val, key) => (<span key={key}>{val} </span>))}
                        </div>
                      </div>
                    </>
                  }
                </div>
              </div>

              <div className="row profile-gutters-sm">
                <div className="col-sm-6 profile-mb-3">
                  <div className="profile-card profile-h-100">
                    <div className="profile-card-body">
                      {/* <h6 className="d-flex align-items-center profile-mb-3"><i className="material-icons text-info mr-2">subscriptions</i>{profileUser?.isContributor ? 'Channels' : 'Subscriptions'}</h6> */}
                      <h6 className="d-flex align-items-center profile-mb-3">
                        <i className="fas fa-balance-scale" style={{ marginTop: '7px', marginRight: ".5rem", fontSize: "20px" }}></i> Reputations</h6>
                      <DisplayUserReps userId={profileUser?.userId} userHandle={profileUser?.userHandle} />
                    </div>
                  </div>
                </div>
                <div className="col-sm-6 profile-mb-3">
                  <div className="profile-card profile-h-100">
                    <div className="profile-card-body">
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