import React, { useEffect, useState } from 'react'
import Nav from 'react-bootstrap/Nav'
import { getUserComments } from '../user_api'
import Loading from '../../shared/Loading';
import { DateTime } from 'luxon';
import { useHistory } from 'react-router-dom';
import { getMyVideo } from '../../player/videoPlayer_api';
import { ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';

const DisplayUserComments = (props) => {
    const { userId, userHandle } = props;
    const [allComments, setAllComments] = useState([])
    const [displayComments, setDisplayComments] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [remarkType, setRemarkType] = useState('Comment')
    const history = useHistory()
    
    useEffect(() => {
        (async () => {
            try {
                let limit = 35;
                setIsLoading(true)
                const res = await getUserComments({ userId, limit })
                setAllComments(res.data.result)
            } catch (error) {
                console.error(error)
            }
        })();
    }, [userId])

    useEffect(() => {
        if (allComments.length) {
            const commQuestAll = remarkType === 'All'
                ? allComments
                : allComments?.filter(CQ => CQ.type === remarkType)
            setDisplayComments(commQuestAll)
            setIsLoading(false)
        }
    }, [remarkType, allComments])

    const goToVideo = async (remark) => {
        let res = await getMyVideo({ videoId: remark.videoId })
        if (!res.data.length){ 
            return toast.warn(`Hm, it seems this video is no longer available 🤔 `, 
            {autoClose: 4000})
        }
        history.push(`/player?_id=${res.data[0]._id}&playMe=${res.data[0].uri}&channel=${res.data[0].channelId}&startAt=${Math.floor(remark.pauseTime)}`)
    }
    if (isLoading) return 'Loading...'
    return (
        <div className='profile-display-comments'>
            <h6 className='d-flex align-items-center profile-mb-3'>
                <i className='material-icons mr-2' style={{ color: '#3FB8AF' }}>speaker_notes</i>
                <Nav justify variant='tabs' defaultActiveKey={remarkType}>
                    <Nav.Link eventKey='All' onSelect={() => setRemarkType('All')}>All</Nav.Link>
                    <Nav.Link eventKey='Comment' onSelect={() => setRemarkType('Comment')}>Comments</Nav.Link>
                    <Nav.Link eventKey='Question' onSelect={() => setRemarkType('Question')}>Questions</Nav.Link>
                    {/* <Nav.Link eventKey='Feedback' onSelect={() => setRemarkType('Feedback')}>Feedbacks</Nav.Link> */}

                </Nav>
            </h6>
            {isLoading && <div className='loading' style={{ textAlign: 'center' }}><Loading /></div>}
            {remarkType !== 'Feedback' &&
                <ListGroup className='remarks-list'>
                    <div className='profile-comment-map profile-scrollable'>
                        {!displayComments.length && !isLoading
                            ?
                            <small>{userHandle} has no {remarkType === 'All' ? 'Comments or Question' : remarkType}s yet</small>
                            : displayComments.map((remark, i) => {
                                return (
                                    <ListGroup.Item
                                        className='remark-listItem'
                                        key={remark._id}
                                        action
                                        onClick={() => goToVideo(remark)}
                                    >
                                        <i className='fa fa-play-circle-o' style={{ color: '#3FB8AF' }} />{'  '}
                                        <small>{remark.userHandle}'s video on {remark.channelName} channel</small>
                                        <br></br>
                                        <small>
                                            {remark.text.substring(0, 50)}...  <br/>{DateTime.fromMillis(parseInt(remark?.timestamp)).toRelative()}</small>
                                    </ListGroup.Item>

                                )
                            })
                        }
                    </div>
                </ListGroup>
            }
            {/* {remarkType === 'Feedback' &&
                <div className='profile-comment-map profile-scrollable'>
                    {!feedbacks.length && !isLoading
                        ? <small>{userHandle} has no Feedbacks yet</small>
                        : feedbacks.map((remark, key) => {
                            return (
                                <div key={key} >
                                    {remark.type === 'thumbsUp'
                                        ? <i className='far fa-thumbs-up' style={{ color: '#3FB8AF', fontSize: '18px' }} />
                                        : <i className='far fa-thumbs-down' style={{ color: '#3FB8AF', fontSize: '18px' }} />
                                    }
                                    <small>{'  '}{remark.explanation}...</small>
                                </div>
                            )
                        })
                    }
                </div>
            } */}
        </div>
    )
}
export default DisplayUserComments;
