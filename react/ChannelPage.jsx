import React, { useContext, useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { observer } from 'mobx-react';
import queryString from 'query-string';
import './ChannelPage.css';
import LoadingBar from 'react-top-loading-bar'
import ShareModal from '../player/ShareModal';
import storeContext from '../../stores/storeContext';
import { forceReload } from '../../utilities/forceReload';
import { channelGet, channelPost } from './channel_api';
import { toast } from 'react-toastify';
import { ChannelPageLoader } from '../shared/Loaders';
import {
    Card, CardGroup, Col, Container, Form,
    FormControl, Image, Nav, Navbar, OverlayTrigger, Row, Tooltip
} from 'react-bootstrap';
import VideoCard from './VideoCard';
import UserCard from '../user/profile/UserCard';
import ConfirmCancelModal from '../../utilities/ConfirmCancelModal';

const ChannelPage = observer(props => {
    const urlSearchParams = queryString.parse(props.location.search);
    const channelId = urlSearchParams.channel;
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0)
    const [isSaving, setIsSaving] = useState(false);
    const [channelData, setChannelData] = useState({
        isSubscribed: false,
        subscribersCount: 0,
        currentChannel: [],
        vids: [],
        displayContentType: 'Videos'
    })
    const { displayContentType, isSubscribed, subscribersCount, currentChannel, vids, } = channelData;
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState({ modal: '', message: '', action: '' })
    const resetModalState = () => setShowModal({ modal: '', message: '', action: '' })
    const store = useContext(storeContext);
    const { userStore, modalStore } = store;
    const { user } = userStore;
    const { setShowShareModal } = modalStore;
    const navTabs = ['Videos', 'Playlists', 'News', 'About'];

    useEffect(() => {
        setProgress(prev => prev + 15)
        const fetchChannelContent = async () => {
            try {
                setProgress(prev => prev + 5)
                const channel = await channelGet('/channels/getTheChannel', { channelId })
                setProgress(prev => prev + 55)
                if (!channel.data.length) {
                    setProgress(100)
                    return forceReload('/error')
                }
                setChannelData(prev => ({
                    ...prev,
                    currentChannel: channel.data[0],
                    vids: channel.data[0].videos,
                    subscribersCount: channel.data[0].subscribersCount,
                }))
                setIsLoading(false)
            }
            catch (error) {
                return forceReload('/error')
            }
            finally { setProgress(100) }
        }
        channelId && fetchChannelContent()
        setTimeout(() => {
            if (!channelId) {
                setProgress(100)
                return forceReload('/error')
            }
        }, 1500)
    }, [channelId]);

    useEffect(() => {
        const amISubscribed = async () => {
            try {
                const res = await channelGet('/subscribers/amIsubscribed', { channelId, userId: user.userId })
                setChannelData(prev => ({
                    ...prev,
                    isSubscribed: res.data ?? false,
                }))
            }
            catch (error) {
                toast.error(`ERROR ${error}`)
            }
        }
        channelId && user.userId && amISubscribed()
    }, [channelId, user.userId]);

    const fakeProgress = () => {
        setProgress(10)
        setTimeout(() => { setProgress(30) }, 200)
        setTimeout(() => { setProgress(100) }, 300)
    }
    
    const displayLoadingBar = <>
        <LoadingBar className='loading-bar'
            shadow={false}
            progress={progress}
            onLoaderFinished={() => setProgress(0)}
        />
    </>

    if (isLoading) {
        return (
            <>
                <div className='channelPage-container'>
                    {displayLoadingBar}
                    <div className='channelPage-wrapper'>
                        <div className='channelPage-loader'>
                            <ChannelPageLoader />
                        </div>
                    </div>
                </div>
            </>
        )
    }

    const subscribeUnsubscribe = async () => {
        try {
            setIsSaving(true)
            setProgress(prev => prev + 5)
            const route = isSubscribed ? '/subscribers/removeSubscriber' : '/subscribers/addSubscriber'
            await channelPost(route, { channelId: currentChannel.channelId, userId: user.userId })
            setProgress(prev => prev + 55)
            setChannelData(prev => ({
                ...prev,
                isSubscribed: !prev.isSubscribed,
                subscribersCount: prev.isSubscribed
                    ? prev.subscribersCount - 1
                    : prev.subscribersCount + 1
            }));
            setIsSaving(false)
        } catch (error) {
            setIsSaving(false)
            toast.error(`ERROR: ${error}`)
        }
        finally { setProgress(100) }
    };

    const displayChannelPageHeader = <>
        <Navbar>
            <Image roundedCircle
                className='channelPage-navbar-avatar'
                src={currentChannel?.avatar || process.env.REACT_APP_BLANK_VIDEO_PIC} />
            <div className='channelPage-navbar-title'>{' '} {currentChannel.title}
                {user.userId &&
                    <OverlayTrigger
                        key={'bookmark-icon'}
                        placement={'top'}
                        overlay={<Tooltip id={`tooltip-${'bookmark-icon'}`}>
                            {isSubscribed ? <>Subscribed!</> : <>Not Subscribed</>}
                        </Tooltip>}
                    >
                        <span>
                            {isSubscribed
                                ? <><i className="fas fa-bookmark channelPage-bookmark-icon" ></i></>
                                : <><i className="far fa-bookmark channelPage-bookmark-icon" ></i></>}
                        </span>
                    </OverlayTrigger>
                }
                <div className='channelPage-navbar-subscribers'>{subscribersCount}{subscribersCount === 1 ? ' Subscriber' : ' Subscribers'}</div>
            </div>
            <Navbar.Toggle />
            <Navbar.Collapse className='justify-content-end'>
                <Nav className='mr-auto'>
                </Nav>
                <Form inline>
                    {displayContentType === 'Videos' &&
                        <>
                            <FormControl
                                className='channelPage-navbar-search'
                                type='text'
                                placeholder={`Search ${displayContentType}`}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)} />
                        </>
                    }
                    {user.userId &&
                        <>
                            <OverlayTrigger
                                key={'sub'}
                                placement={'top'}
                                overlay={<Tooltip id={`tooltip-${'sub'}`}>
                                    {isSubscribed ? <>Unsubscribe</> : <>Subscribe</>}
                                </Tooltip>}
                            >
                                <div className={'channelPage-subscribe'}>
                                    <Form.Check
                                        disabled={isSaving}
                                        type='switch'
                                        checked={isSubscribed}
                                        id='custom-switch'
                                        onChange={() => {
                                            isSubscribed
                                                ? setShowModal({
                                                    modal: 'confirmCancel',
                                                    message: 'Are you sure you want to unsubscribe?',
                                                    action: subscribeUnsubscribe
                                                })
                                                : subscribeUnsubscribe();
                                        }} />
                                </div>
                            </OverlayTrigger>
                            <OverlayTrigger
                                key={'share'}
                                placement={'top'}
                                overlay={<Tooltip id={`tooltip-${'top'}`}>
                                    Share this Channel!
                                </Tooltip>}
                            >
                                <i className="fas fa-share-alt channelPage-share"
                                    onClick={() => setShowShareModal(true)}></i>
                            </OverlayTrigger>
                        </>
                    }
                </Form>
            </Navbar.Collapse>
        </Navbar>
    </>

    const displayNavTabs = <>
        <Nav defaultActiveKey='Videos'
            onSelect={(selectedKey) => {
                if (selectedKey !== displayContentType) fakeProgress()
                setChannelData(prev => ({ ...prev, displayContentType: selectedKey }))
            }}
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
        {displayContentType === 'Videos' &&
            <div className='channelPage-cards-wrapper'>
                <CardGroup className='channelPage-cardGroup'>
                    {vids?.filter(T => T.title.includes(searchTerm))
                        .map((video, index) => (
                            <div key={index} className='channelPage-cardGroup-card channelPage-card-hover-effect'>
                                <VideoCard
                                    video={video}
                                    action={() => forceReload(`/player?video=${video?.videoId}`)}
                                />
                            </div>
                        )
                        )}
                </CardGroup>
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
                    <Col sm={8}>{currentChannel.description}
                    </Col>
                    <Col>
                        <div className='channelPage-owner-col channelPage-card-hover-effect'>
                            <i className='fas fa-crown channelPage-owner-icon'></i>
                            <span className='channelPage-owner-title'>Owner</span>
                            <i className='fas fa-crown channelPage-owner-icon'></i>
                            <UserCard cardUserId={currentChannel.userId}
                                loggedInUserId={user.userId} />
                        </div>
                    </Col>
                </Row>
            </Container>
        }
    </>

    const displayModals = <>
        {showModal.modal === 'confirmCancel' &&
            <ConfirmCancelModal
                show={true}
                message={showModal.message}
                action={showModal.action}
                close={() => resetModalState()}
            />
        }
        <ShareModal shareType={'Channel'}
            shareUrl={`dev.REPLACE_HOSTNAME.social/channelPage?channel=${currentChannel?.channelId}`} />
    </>

    return (
        <>
            <div className='channelPage-container'>
                {displayLoadingBar}
                <div className='channelPage-wrapper'>
                    <Row className='channelPage-navbar'>
                        <Col>
                            {displayChannelPageHeader}
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
    );
}
);

export default withRouter(ChannelPage);