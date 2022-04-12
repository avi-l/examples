import React, { useState, useEffect, useCallback } from 'react'
import { Card, Image, Navbar, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import './DisplayFollowPosts.css'
import { FeedPostLoader, LoadingIcon } from '../../shared/Loaders';
import { channelGet } from '../../channel/channel_api';
import { DateTime } from 'luxon';
import { toast } from 'react-toastify';
import InfiniteScroll from 'react-infinite-scroll-component';
import ReactPlayer from 'react-player/lazy';
import { forceReload } from '../../../utilities/forceReload';

const DisplayFollowPosts = (props) => {
    const { userId } = props;
    const [isLoading, setIsLoading] = useState(true);
    const [lastPosition, setLastPosition] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [channelIds, setChannelIds] = useState([])
    const [channelData, setChannelData] = useState([])
    const [feed, setFeed] = useState([])
    let [state, setState] = useState({
        pip: false,
        controls: true,
        light: true,
        volume: 1, // Change this in production
        muted: false,
        played: 0,
        loaded: 0,
        duration: 0,
        playbackRate: 1.0,
        loop: false
    });
    const { controls, light, volume, muted, loop, playbackRate, played, pip } = state
    const perPage = 2;
    const history = useHistory()
    const displayTitleBar = <>
        <Navbar className='profile-main-body-navbar'>
            <div className='profile-main-body-navbar-text'>
                Latest Videos</div>
        </Navbar>
    </>

    useEffect(() => {
        const getChannelDetails = async () => {
            try {
                const chan = await channelGet('/subscribers/getMyChannels', { userId })
                if (!chan.data.length) setIsLoading(false)
                setChannelData(chan.data)
                setChannelIds(chan.data.map(chan => chan.channelDetails.channelId))
            } catch (error) {
                toast.error(`Error fetching subscriptions: ${error}`)
            }
        }
        userId && getChannelDetails();
    }, [userId])

    useEffect(() => {
        (async () => {
            try {
                if (channelIds.length) {
                    setLastPosition(perPage)
                    setHasMore(true)
                    const res = await channelGet('/videos/getMySubscribedVidsFeed',
                        { channelIds, skip: 0, limit: perPage })
                    if (!res.data.length) setHasMore(false)
                    setFeed(res.data)
                    setIsLoading(false)
                }
            } catch (error) {
                setIsLoading(false)
                toast.error(`Error fetching subscriptions: ${error}`)
            }
        })();
    }, [channelIds])

    const fetchMoreVids = useCallback(async () => {
        try {
            const res = await channelGet('/videos/getMySubscribedVidsFeed',
                { channelIds, skip: lastPosition, limit: perPage })
            if (!res.data.length) setHasMore(false)
            else {
                setTimeout(() => {
                    setFeed(feed.concat(res.data))
                    setHasMore(true)
                    setLastPosition(lastPosition + perPage)
                }, 500)
            }

        } catch (error) {
            setHasMore(false)
            toast.error(`Error fetching subscriptions: ${error}`)
        }
    }, [channelIds, feed, lastPosition])



    if (isLoading) {
        return (
            <div className='displayFollowPosts-container' id='scrollableDiv' >
                {/* {displayTitleBar} */}
                {[...Array(10).keys()].map((i) => (
                    <div key={i}>
                        <Card className='post-card'>
                            <Card.Body className='post-card-loader'>
                                <FeedPostLoader />
                                <br />
                            </Card.Body>
                        </Card>
                        <br />
                    </div>
                ))}
            </div>
        )
    }
    return (

        <div className='displayFollowPosts-container' id='scrollableDiv'>

            {!feed.length && !hasMore && <>
                <div className='displayFollowPosts-container' >
                    <Card className='post-card'>
                        <Card.Header> <Card.Text>Not subscribed to any channels yet!</Card.Text></Card.Header>
                        <Card.Body className='post-card-body'>
                            <Card.Text>Subscribe to some channels to start seeing the latest videos in your feed</Card.Text>
                        </Card.Body>
                    </Card>
                </div>
            </>}
            <div className='displayFollowPosts-inf-scroller'>
                <InfiniteScroll
                    hasMore={hasMore}
                    dataLength={feed?.length}
                    next={fetchMoreVids}
                    height={800}
                    scrollableTarget='scrollableDiv'
                    loader={<div className='mini-loader'>{hasMore ? <LoadingIcon /> : <p></p>}</div>}
                >
                    {/* {displayTitleBar} */}
                    {feed.map((v, i) => (
                        <div key={i}>
                            <Card className='post-card'>
                                <Card.Header className='post-card-header'>
                                    <OverlayTrigger
                                        delay={500}
                                        key={`Channel Tool Tip ${i}`}
                                        placement={'right'}
                                        overlay={<Tooltip id={'Channel'} >Click to go to the {' '}
                                            {channelData.map(c => c.channelDetails?.channelId === v.channelId
                                                ? c.channelDetails?.title
                                                : 'Unknown')}Channel page </Tooltip>}>
                                        <Navbar.Brand className='post-card-hover-color' onClick={() => history.push((`/channelPage?channel=${v.channelId}`))}>
                                            {channelData.map((c, k) => c.channelDetails?.channelId === v.channelId
                                                ? <Image key={k} roundedCircle
                                                    className='post-card-channel-avatar '
                                                    src={c?.channelDetails.avatar || process.env.REACT_APP_BLANK_VIDEO_PIC} />
                                                : <i className='fas fa-tv post-card-hover-color'></i>
                                            )}
                                            <span className='post-card-hover-color post-card-header-title'>
                                                Channel: {channelData.map(c => c.channelDetails?.channelId === v.channelId
                                                    ? c.channelDetails?.title
                                                    : 'Unknown')}</span>
                                        </Navbar.Brand>
                                    </OverlayTrigger>
                                </Card.Header>
                                <ReactPlayer url={v.videoUri}
                                    // poster={''}
                                    pip={pip}
                                    controls={controls}
                                    light={v.thumb || process.env.REACT_APP_BLANK_VIDEO_PIC}
                                    loop={loop}
                                    width={`100%`}
                                    // height={`100%`}
                                    playbackRate={playbackRate}
                                    volume={volume}
                                    muted={muted}
                                    playing={true}
                                />
                                <OverlayTrigger
                                    delay={10}
                                    key={`Player Tool Tip ${i}`}
                                    placement={'bottom'}
                                    overlay={<Tooltip id={'Player'} >Click to join the discussion about {v.title}</Tooltip>}>
                                    <Card.Body className='post-card-body post-card-hover-color'
                                        onClick={() => forceReload((`/player?video=${v?.videoId}`))}
                                    >
                                        <Card.Title>{v.title}</Card.Title>
                                        <Card.Text className='post-card-description'>
                                            {v.description}
                                        </Card.Text>
                                    </Card.Body>
                                </OverlayTrigger>
                                <div className='video-card-below-body-text'>
                                    <Card.Text>
                                        <span className='video-card-view-count text-muted'>{v.views} {v.views !== 1 ? 'views' : 'view'}</span>
                                        <span className='bullet-point text-muted'> • </span>
                                        <span className='video-card-uploaded-date text-muted'>{DateTime.fromMillis(parseInt(v?.addedAt)).toRelative()}</span>
                                    </Card.Text>
                                </div>
                            </Card>
                            <br />
                        </div>
                    ))
                    }
                </InfiniteScroll>
            </div>
        </div>
    )
}
export default DisplayFollowPosts;