import React, { useContext, useState } from 'react';
import storeContext from '../../stores/storeContext';
import SlideOut from "@ijsto/react-slideout";
import './Sidebar.css'
import { observer } from 'mobx-react';
import { Card, Image, ListGroup, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import FollowersModal from '../user/profile/FollowersModal';
import { sidebarMenuItems } from '../home/staticContent';
import { updateUserDetails } from '../user/user_api';
import { toast } from 'react-toastify';
import GenericModal from '../shared/GenericModal';
import PhotoUploader from '../shared/PhotoUploader';
import { Squash as Hamburger } from 'hamburger-react'

const Sidebar = observer(() => {
  const [show, setShow] = useState(false);
  const [showModal, setShowModal] = useState({ modal: '', message: '', action: '', folder: '' })
  const store = useContext(storeContext);
  const { userStore } = store;
  const { user, setUser } = userStore;
  const history = useHistory()
  const resetModalState = () => setShowModal({ modal: '', message: '', action: '', folder: '' })

  if (!user.userId) return null;
  const updateAvatarUrl = async (url) => {
    try {
      const res = await updateUserDetails({
        userId: user.userId,
        userData: { ...user, avatar: url },
        userResources: { ...user.userResources }
      })
      if (res.status !== 200) {
        toast.error(res.statusText)
        return
      }
      setUser({ ...user, avatar: url })
      resetModalState()
      toast.success('Photo uploaded successfully!',
        { position: 'top-center' })
    } catch (error) {
      toast.error(`${error}: Backend Error`)
      return;
    }
  }
  const displayFollowTabs = <>
    <ListGroup horizontal className='sidebar-follow'>
      <ListGroup.Item className='sidebar-follow sidebar-followers sidebar-follow-count'
        onClick={() => setShowModal({ modal: 'followers' })}
      >{user?.userResources?.totalFollowers || 0}
        <br />
        <span className='sidebar-follow-text'>Followers</span>
      </ListGroup.Item>
      <ListGroup.Item className='sidebar-follow sidebar-following sidebar-follow-count'
        onClick={() => setShowModal({ modal: 'following' })}
      >{user?.userResources?.totalFollowing || 0}
        <br />
        <span className='sidebar-follow-text'>Following</span>
      </ListGroup.Item>
    </ListGroup>
  </>
  const displayModals = <>
    {(showModal.modal === 'followers' || showModal.modal === 'following') &&
      <FollowersModal
        show={true}
        type={showModal.modal}
        user={user}
        loggedInUserId={user.userId}
        close={() => resetModalState()}
      />
    }
    {showModal.modal === 'uploadPic' &&
      <GenericModal
        show={true}
        title={'Upload A Profile Pic'}
        body={<PhotoUploader
          folder={showModal.folder}
          onSuccess={showModal.action}
        />}
        close={() => resetModalState()}
      />}
  </>

  const displayMenuItems = <>
    <Card className='sidebar-menu-card'>
      <Card.Body className='sidebar-menu-card-body'>
        <div className='sidebar-avatar-container'>
          <Image roundedCircle
            src={user?.avatar ?? process.env.REACT_APP_BLANK_USER_AVATAR}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = process.env.REACT_APP_BLANK_USER_AVATAR;
            }}
            alt={user?.userHandle} className='sidebar-avatar'
          />
          <div className='sidebar-avatar-overlay'
            title='Upload Profile Pic'
            onClick={() => setShowModal({ modal: 'uploadPic', folder: 'avatars', action: updateAvatarUrl })} >
            <i className='fas fa-camera sidebar-clickable-icon' />
          </div>
        </div>
        <div className='sidebar-userHandle' >{user?.userHandle}</div>
        <div>
          <div className='sidebar-user-name'>{user?.firstName} {user?.lastName}</div>
          <>{displayFollowTabs}</>
          <br />
        </div>

        <ListGroup className='sidebar-sidebar-listgroup fa-ul' variant='flush'>
          {sidebarMenuItems.map((i, k) => (
            <ListGroup.Item key={k} className='sidebar-listgroup-item'
              onClick={() => {
                history.push(i.link)
                setShow(prev => !prev)
              }}>
              <span className='fa-li'><i className={`${i.icon} sidebar-icon`} /></span> {i.text}
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card >
  </>

  return (
    <>
      <span className='sidebar-hamburger-icon'>
        <Hamburger rounded
          size={22}
          color='#fff' 
          distance="md"
          toggled={show}
          toggle={() => setShow(prev => !prev)}
        />
      </span>
      <SlideOut
        isOpen={show}
        onClose={() => setShow(prev => !prev)}
        hideClose={true}
        width='225px'
        bg='#f0efeb'
        offsetTop='56px'
        speed='0.4s'
      >      {displayModals}
        {displayMenuItems}
      </SlideOut>

    </>
  );
});

export default Sidebar;