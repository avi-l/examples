import React, { useContext, useEffect, useState } from 'react'
import storeContext from '../../../stores/storeContext';
import { Button, Card, Col, Container, Form, FormControl, Image, ListGroup, Nav, Navbar, OverlayTrigger, Row, Tooltip } from 'react-bootstrap';
import { observer } from 'mobx-react';
import { logout } from '../userManagement';
import { amIfollowing, followUnfollowUser, getUser, updateUserDetails } from '../user_api';
import { forceReload } from '../../../utilities/forceReload';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import EditProfile from './EditProfile';
import DisplayUserComments from './DisplayUserComments';
import DisplayUserReps from './DisplayUserReputations';
import SearchUsers from '../SearchUsers';
import FollowersModal from './FollowersModal';
import GenericModal from '../../shared/GenericModal';
import PhotoUploader from '../../shared/PhotoUploader';
import DisplayFollowPosts from './DisplayFollowPosts';
import ConfirmCancelModal from '../../../utilities/ConfirmCancelModal';
import DisplayUserDetails from './DisplayUserDetails';
import DisplayChannelCards from './DisplayChannelCards';
import { ProfilePageLoader } from '../../shared/Loaders';
import LoadingBar from 'react-top-loading-bar'
import './Profile.css'
import ChangePassword from '../ChangePassword';

const ProfileDisplay = observer((props) => {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState(0)
  const [showModal, setShowModal] = useState({ modal: '', message: '', action: '', folder: '' })
  const [showFeed, setShowFeed] = useState(true)
  const [displayContentType, setDisplayContentType] = useState('Feed')
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileUser, setProfileUser] = useState({})
  const { profileUserId } = props;
  const store = useContext(storeContext);
  const { userStore } = store;
  const { user, setUser } = userStore;
  const history = useHistory();
  const navTabs = ['Feed', 'Subscriptions', 'Comments', 'Questions', 'Reputations'];

  useEffect(() => {
    (async () => {
      setProgress(prev => prev + 5)
      const fetchUserId = profileUserId ? profileUserId : user.userId
      const isFullDetails = profileUserId !== user.userId
      const toastOptions = { autoClose: 2500, position: 'top-center', onClose: () => forceReload('/') }
      if (fetchUserId) {
        try {
          setProgress(prev => prev + 5)
          const res = await getUser({ userId: fetchUserId, isFullDetails })
          setProfileUser(res.data)
          setProgress(prev => prev + 55)
          if (!res) return toast.error(`User Not Found`, toastOptions)
          setIsLoading(false)
        } catch (error) {
          toast.error(`Unable to reach backend ${error}`, { position: 'top-center' })
        } finally { setProgress(100) }
      }
    })();
  }, [profileUserId, user.userId])

  useEffect(() => {
    if (profileUserId && user.userId && profileUserId !== user.userId) {
      (async () => {
        try {
          const res = await amIfollowing('/follows/amIfollowing', { follower: user.userId, following: profileUserId })
          setIsFollowing(res.data)
        } catch (error) {
          toast.error(`${error}: Unable to determine if you are following this user`)
        }
      })();
    }
  }, [profileUserId, user.userId])

  const displayLoadingBar = <>
    <LoadingBar className='loading-bar'
      shadow={false}
      progress={progress}
      onLoaderFinished={() => setProgress(0)}
    />
  </>

  if (isLoading) {
    return (
      <div className='profile-page'>
        {displayLoadingBar}
        <div className='profile-loading-container'>
          <ProfilePageLoader />
        </div>
      </div>
    )
  }

  const fakeProgress = () => {
    setProgress(10)
    setTimeout(() => { setProgress(30) }, 200)
    setTimeout(() => { setProgress(100) }, 300)
  }

  const resetModalState = () => setShowModal({ modal: '', message: '', action: '', folder: '' })

  const followUnfollow = async () => {
    try {
      setIsSaving(true)
      const route = isFollowing ? '/follows/unfollow' : '/follows/follow'
      const res = await followUnfollowUser(route, { following: profileUser.userId, follower: user.userId })
      if (res.status !== 200) return toast.error(res.statusText)
      setProfileUser(prev => ({
        ...prev,
        userResources: {
          ...prev.userResources,
          totalFollowers: isFollowing
            ? prev.userResources?.totalFollowers - 1
            : prev.userResources?.totalFollowers + 1
        }
      }))
      setIsFollowing(prev => !prev)

    } catch (error) {
      toast.error(`${error}: Backend Error`)
    } finally { setIsSaving(false) }
  }

  const updateAvatarUrl = async (url) => {
    try {
      const res = await updateUserDetails({
        userId: user.userId,
        userData: { ...profileUser, avatar: url },
        userResources: { ...profileUser.userResources }
      })
      if (res.status !== 200) {
        toast.error(res.statusText)
        return
      }
      setProfileUser({ ...profileUser, avatar: url })
      setUser({ ...user, avatar: url })
      resetModalState()
      toast.success('Photo uploaded successfully!',
        { position: 'top-center' })
    } catch (error) {
      toast.error(`${error}: Backend Error`)
      return;
    }
  }

  const displayNameAvatar = <>
    <div className='profile-avatar-container'>
      <Image roundedCircle
        src={profileUser?.avatar || process.env.REACT_APP_BLANK_USER_AVATAR}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null; // prevents looping
          currentTarget.src = process.env.REACT_APP_BLANK_USER_AVATAR;
        }}
        alt={profileUser?.userHandle} className='profile-avatar'
      />
      {profileUser?.userId === user.userId &&
        <div className='profile-avatar-overlay'
          title='Upload Profile Pic'
          onClick={() => setShowModal({ modal: 'uploadPic', folder: 'avatars', action: updateAvatarUrl })} >
          <i className='fas fa-camera profile-clickable-icon' />
        </div>
      }
    </div>
    <h5 className='mt-3'>{profileUser?.userHandle}</h5>
    <div>
      {profileUser?.firstName} {profileUser?.lastName}
    </div>
  </>

  const displayFollowTabs = <>
    <ListGroup horizontal className='profile-follow'>
      <ListGroup.Item className='profile-follow profile-followers profile-follow-count'
        onClick={() => setShowModal({ modal: 'followers' })}
      >{profileUser?.userResources?.totalFollowers || 0}
        <br />
        <span className='profile-follow-text'>Followers</span>
      </ListGroup.Item>
      <ListGroup.Item className='profile-follow profile-following profile-follow-count'
        onClick={() => setShowModal({ modal: 'following' })}
      >{profileUser?.userResources?.totalFollowing || 0}
        <br />
        <span className='profile-follow-text'>Following</span>
      </ListGroup.Item>
    </ListGroup>
  </>

  const displayModals = <>
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
    {showModal.modal === 'editProfile' &&
      <GenericModal
        show={true}
        title={<Image roundedCircle
          src={profileUser?.avatar || process.env.REACT_APP_BLANK_USER_AVATAR}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null; // prevents looping
            currentTarget.src = process.env.REACT_APP_BLANK_USER_AVATAR;
          }}
          alt={profileUser?.userHandle}
          className='edit-profile-avatar'
        />}
        body={<EditProfile {...{ profileUser, setProfileUser }} />}
        close={() => resetModalState()}
      />
    }
    {showModal.modal === 'userDetails' &&
      <GenericModal
        show={true}
        title={<i className='fas fa-address-card fa-2x profile-sidebar-icon'></i>}
        body={<DisplayUserDetails {...{ profileUser, user }} />}
        close={() => resetModalState()}
      />
    }
    {(showModal.modal === 'followers' || showModal.modal === 'following') &&
      <FollowersModal
        show={true}
        type={showModal.modal}
        user={profileUser}
        loggedInUserId={user.userId}
        close={() => resetModalState()}
      />
    }
    {showModal.modal === 'confirmCancel' &&
      <ConfirmCancelModal
        show={true}
        message={showModal.message}
        action={showModal.action}
        close={() => resetModalState()}
      />
    }
    {showModal.modal === 'searchUsers' &&
      <GenericModal
        show={true}
        title={'Find Someone on REPLACE_HOSTNAME.Social'}
        body={<SearchUsers />}
        close={() => resetModalState()}
      />
    }
    {showModal.modal === 'changePass' &&
      <GenericModal
        show={true}
        body={<ChangePassword />}
        close={() => resetModalState()}
      />
    }
  </>

  const displayLeftSideMenu = <>
    <Card className='profile-card-sidebar'>
      <Card.Body className='profile-card-body'>
        <div className='d-flex flex-column align-items-center text-center profile-avatar-card'>
          <>{displayNameAvatar}</>
          <>{displayFollowTabs}</>
          <br />
        </div>
        <ListGroup className='profile-sidebar-listgroup' variant='flush'>
          {profileUser?.userId !== user.userId ?
            <>
              <ListGroup.Item className='profile-sidebar-listgroup-item'
                onClick={() => history.push('/chat/?friend=' + profileUser?.userId)}>
                <i className='far fa-comment-dots profile-sidebar-icon' />Send Message</ListGroup.Item>
              <ListGroup.Item className='profile-sidebar-listgroup-item'
                onClick={() => followUnfollow()}>
                {isFollowing
                  ? <><i className='fas fa-user-minus profile-sidebar-icon' />Unfollow</>
                  : <><i className='fas fa-user-plus profile-sidebar-icon' />Follow</>
                }
              </ListGroup.Item>

              {/* <ListGroup.Item className='profile-sidebar-listgroup-item'
                onClick={() => setShowModal({ modal: 'userDetails' })}>
                <i className='fas fa-info-circle profile-sidebar-icon' />{profileUser.userHandle}'s Info</ListGroup.Item> */}
            </>
            :
            <>
              <ListGroup.Item className='profile-sidebar-listgroup-item'
                onClick={() => {
                  setShowFeed(prev => !prev)
                  fakeProgress()
                }}>
                {showFeed
                  ? <><i className='fas fa-bookmark profile-sidebar-icon' />Subscriptions</>
                  : <><i className='fas fa-film profile-sidebar-icon' />Feed</>
                }
              </ListGroup.Item>
              <ListGroup.Item className='profile-sidebar-listgroup-item'
                onClick={() => history.push('/chat/')}>
                <i className='fas fa-comment-dots profile-sidebar-icon' />Messages</ListGroup.Item>
              <ListGroup.Item className='profile-sidebar-listgroup-item'
                onClick={() => setShowModal({ modal: 'userDetails' })}>
                <i className='fas fa-info-circle profile-sidebar-icon' />{profileUser.userHandle}'s Info</ListGroup.Item>
              {/* <ListGroup.Item className='profile-sidebar-listgroup-item'
                onClick={() => history.push('/')}>
                <i className='fas fa-globe profile-sidebar-icon' />Explore</ListGroup.Item> */}
              <ListGroup.Item className='profile-sidebar-listgroup-item'
                onClick={() => setShowModal({ modal: 'searchUsers' })}>
                <i className='fas fa-users profile-sidebar-icon' />Find Someone</ListGroup.Item>
              <ListGroup.Item className='profile-sidebar-listgroup-item'
                onClick={() => setShowModal({ modal: 'editProfile' })}>
                <i className='fas fa-user-edit profile-sidebar-icon' />Edit My Info</ListGroup.Item>
              {profileUser.authProvider === 'Cognito' &&
                <ListGroup.Item className='profile-sidebar-listgroup-item'
                  onClick={() => setShowModal({ modal: 'changePass' })}>
                  <i className='fas fa-key profile-sidebar-icon' />Change Password</ListGroup.Item>
              }
              <ListGroup.Item className='profile-sidebar-listgroup-item'
                onClick={() => setShowModal({ modal: 'confirmCancel', message: 'Are you sure you want to sign out?', action: logout })}>
                <i className='fas fa-sign-out-alt profile-sidebar-icon' />Sign out</ListGroup.Item>
              <ListGroup.Item className='profile-sidebar-listgroup-item'
                onClick={() => history.push('/deleteAccount')}>
                <i className='fas fa-user-times profile-sidebar-icon' />Deactivate Account</ListGroup.Item>
            </>
          }
        </ListGroup>
      </Card.Body>
    </Card >
  </>
  const displayNavTabs = <>
    <Nav defaultActiveKey='Feed'
      onSelect={(selectedKey) => {
        if (selectedKey !== displayContentType) fakeProgress()
        setDisplayContentType(selectedKey)
      }
      }
    >
      {navTabs.map((tab, idx) => (
        <Nav.Item key={idx} className={displayContentType === tab ? 'channelPage-navLinks-active-tab' : 'channelPage-navLinks-tab'}>
          <Nav.Link key={idx} style={{ color: 'grey' }} eventKey={tab}>
            {tab}
          </Nav.Link>
        </Nav.Item>
      ))}
    </Nav>
  </>

  const displayContent = <>
    {displayContentType === 'Subscriptions' &&
      <div className='channelPage-cards-wrapper'>
        <Col xs={10} md={8}><DisplayChannelCards userId={profileUser.userId} /></Col>
      </div>
    }
    {displayContentType === 'Feed' &&
      <div className='channelPage-cards-wrapper'>
        <Col xs={8}>
          <DisplayFollowPosts userId={profileUser.userId} />
        </Col>
      </div>
    }
    {(displayContentType === 'Comments' || displayContentType === 'Questions') &&
      <div className='channelPage-cards-wrapper'>
        <Col xs={8}>
          <DisplayUserComments
            userId={profileUser?.userId}
            userHandle={profileUser?.userHandle}
            remarkType={displayContentType.slice(0, -1)} />
        </Col>
      </div>
    }
    {displayContentType === 'Reputations' &&
      <div className='channelPage-cards-wrapper'>
        <Col xs={8}>
          <DisplayUserReps userId={profileUser?.userId} userHandle={profileUser?.userHandle} />
        </Col>
      </div>
    }
    {displayContentType === 'Playlists' &&
      <div className='channelPage-cards-wrapper'>
        {[...Array(30).keys()].map((i) => (
          <Card bg='secondary' key={i} style={{ width: '15rem' }} className='channelPage-cardGroup-card channelPage-card-hover-effect'>
            <Card.Body>
              <Card.Title>Playlist {i}</Card.Title>
              <Card.Text>
                Coming Soon!
              </Card.Text>
            </Card.Body>
          </Card>
        ))
        }
      </div>
    }
    {displayContentType === 'News' &&
      <div className='channelPage-cards-wrapper'>
        {[...Array(30).keys()].map((i) => (
          <Card bg='secondary' key={i} style={{ width: '100vw' }} className='channelPage-cardGroup-card channelPage-card-hover-effect'>
            <Card.Body>
              <Card.Title>News {i}</Card.Title>
              <Card.Text>
                Coming Soon!
              </Card.Text>
            </Card.Body>
          </Card>
        ))
        }
      </div>
    }
    {displayContentType === 'About' &&
      <Container>
        <Row>
          <Col sm={8}>
          </Col>
          <Col>
            <div className='channelPage-owner-col channelPage-card-hover-effect'>
              <i className='fas fa-crown channelPage-owner-icon'></i>
              <span className='channelPage-owner-title'>Owner</span>
              <i className='fas fa-crown channelPage-owner-icon'></i>

            </div>
          </Col>
        </Row>
      </Container>
    }
  </>
  const displayProfileHeader = <>
    <Navbar>
      <Image roundedCircle
        className='channelPage-navbar-avatar'
        src={profileUser?.avatar || process.env.REACT_APP_BLANK_USER_AVATAR} />
      <div className='channelPage-navbar-title'>{' '} {profileUser.userHandle}
        {user.userId &&
          <OverlayTrigger
            key={'bookmark-icon'}
            placement={'top'}
            overlay={<Tooltip id={`tooltip-${'bookmark-icon'}`}>
              {/* {isSubscribed ? <>Subscribed!</> : <>Not Subscribed</>} */}
            </Tooltip>}
          >
            <span>
              {/* {isSubscribed
                        ? <><i className="fas fa-bookmark channelPage-bookmark-icon" ></i></>
                        : <><i className="far fa-bookmark channelPage-bookmark-icon" ></i></>} */}
            </span>
          </OverlayTrigger>
        }
        <div className='channelPage-navbar-subscribers profile-follow' onClick={() => setShowModal({ modal: 'followers' })}>
          {profileUser.userResources.totalFollowers}
          {profileUser.userResources.totalFollowers === 1 ? ' Follower' : ' Followers'}
          <span className='bullet-point text-muted'> • </span>
          {profileUser.userResources.totalFollowing} {' '} Following
        </div>
      </div>
      <Navbar.Toggle />
      <Navbar.Collapse className='justify-content-end'>
        <Nav className='mr-auto'>
        </Nav>
        <Form inline>
          {profileUser.userId !== user.userId &&
            <>
              <OverlayTrigger
                key={'share'}
                placement={'top'}
                overlay={<Tooltip id={`tooltip-${'top'}`}>
                  Follow {profileUser.userHandle}!
                </Tooltip>}
              >
                {isSaving ?
                  <Button className='profile-page-btn' variant='outline-warning'>
                    <><i className='far fa-save' title='unfollow' />{' '}Saving..</>
                  </Button>
                  : <Button className='profile-page-btn' variant='outline-primary'
                    disabled={isSaving}
                    onClick={() => followUnfollow()}>
                    {isFollowing
                      ? <><i className='fas fa-user-minus ' title='unfollow' />{' '} Unfollow</>
                      : <><i className='fas fa-user-plus ' title='follow' /> {' '} Follow </>
                    }
                  </Button>
                }
              </OverlayTrigger>
            </>
          }
        </Form>
      </Navbar.Collapse>
    </Navbar>
  </>

  return (
    <>
      <div className='channelPage-container'>
        {displayLoadingBar}
        <div className='channelPage-wrapper'>
          <Row className='channelPage-navbar'>
            <Col>
              {displayProfileHeader}
            </Col>
          </Row>
          <Row className='channelPage-navLinks'>
            <Col>
              {displayNavTabs}
            </Col>
          </Row>
          <Row className='channelPage-main-body'>
            <Col>
              <Container fluid >
                {displayContent}
              </Container>
            </Col>
          </Row>
        </div>
        {displayModals}
      </div>
    </>
    // <div className='profile-page'>
    //   {displayLoadingBar}
    //   <Row className='profile-main-body'>
    //     {displayModals}
    //     <Col className='profile-card-sidebar'>
    //       {displayLeftSideMenu}
    //     </Col>
    //     {profileUser?.userId === user.userId
    //       ?
    //       <>
    //         {showFeed
    //           ? <><Col xs={6}><DisplayFollowPosts userId={profileUser.userId} /></Col></>
    //           : <Col xs={10} md={8}><DisplayChannelCards userId={profileUser.userId} /></Col>
    //         }
    //         <Col xs={1}>
    //           {showFeed &&
    //             <>
    //               <DisplayUserComments userId={profileUser?.userId} userHandle={profileUser?.userHandle} />
    //               <br />
    //               <DisplayUserReps userId={profileUser?.userId} userHandle={profileUser?.userHandle} />
    //             </>
    //           }
    //         </Col>
    //       </>
    //       :
    //       <>
    //         <DisplayUserComments userId={profileUser?.userId} userHandle={profileUser?.userHandle} />
    //         <DisplayUserReps userId={profileUser?.userId} userHandle={profileUser?.userHandle} />
    //       </>
    //     }
    //   </Row>

    // </div>

  )
})
export default ProfileDisplay;