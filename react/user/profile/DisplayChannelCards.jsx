import React, { useEffect, useState } from 'react'
import { Card, Image, Navbar } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';
import { channelGet } from '../../channel/channel_api';
import { ChannelCardLoader } from '../../shared/Loaders';
import './DisplayChannelCards.css'

const DisplayChannelCards = (props) => {
    const { userId } = props;
    const [isLoading, setIsLoading] = useState(true)
    const [channelsArr, setChannelsArr] = useState([])
    const history = useHistory()

    const displayTitleBar = <>
        <Navbar className='profile-main-body-navbar'>
            <div className='profile-main-body-navbar-text'>
                My Subscriptions</div>
        </Navbar>
    </>

    useEffect(() => {
        const fetchChannels = async () => {
            try {
                const res = await channelGet('/subscribers/getMyChannels', { userId })
                setChannelsArr(res.data)
            } catch (error) {
                toast.error(`Error fetching subscriptions: ${error}`)
            }
            finally { setIsLoading(false) }
        }
        userId && fetchChannels()
    }, [userId])


    if (isLoading) {
        return (
            <>
                {/* {displayTitleBar} */}
                <div className='displayChannelCards-container' >
                    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i}>
                            <Card className='channel-card'>
                                <div className='channel-card-loader'>
                                    <ChannelCardLoader />
                                </div>
                            </Card>
                            <br />
                        </div>
                    ))}
                </div>
            </>
        )
    }
    return (
        <>
            {/* {displayTitleBar} */}
            <div className='displayChannelCards-container'>
                {!channelsArr.length && <>
                    <div className='displayFollowPosts-container' >
                        <Card className='post-card'>
                            <Card.Header> Not subscribed to any channels yet!</Card.Header>
                            <Card.Body className='post-card-body'>
                                Subscribe to channels and you'll find your subscriptions here
                            </Card.Body>
                        </Card>
                    </div>
                </>}
                {channelsArr.map((C, i) => (
                    <div key={i}>
                        <Card className='channel-card' onClick={() => history.push((`/channelPage?channel=${C.channelDetails.channelId}`))}>
                            <Image roundedCircle className='channel-card-thumb'
                                src={C.channelDetails?.avatar || process.env.REACT_APP_BLANK_VIDEO_PIC} />
                            <Card.Body>
                                <Card.Title>{C.channelDetails?.title}</Card.Title>
                                <Card.Text>
                                    {C.channelDetails?.description.substring(0, 80)}...
                                </Card.Text>
                            </Card.Body>
                        </Card>
                        <br />
                    </div>
                ))
                }
            </div>
        </>
    )
}
export default DisplayChannelCards;