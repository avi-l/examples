import React, { useEffect, useState } from 'react'
import Nav from 'react-bootstrap/Nav'
import { getUserComments } from '../user_api'
import { DateTime } from 'luxon';
import { useHistory } from 'react-router-dom';
import { getMyVideo } from '../../player/videoPlayer_api';
import { Card, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ListLoader } from '../../shared/Loaders';

const DisplayUserComments = (props) => {
    const { userId, userHandle, remarkType } = props;
    const [allComments, setAllComments] = useState([])
    const [displayComments, setDisplayComments] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    // const [remarkType, setRemarkType] = useState('Comment')
    const history = useHistory()

    useEffect(() => {
        const getComms = async () => {
            try {
                let limit = 35;
                const res = await getUserComments({ userId, limit })
                setAllComments(res.data.result)
               
            } catch (error) {
                console.error(error)
            }
        }
        userId && getComms();
    }, [userId])

    useEffect(() => {
        if (allComments.length && remarkType) {
            // const commQuestAll = remarkType === 'All'
            //     ? allComments
            //     : allComments?.filter(CQ => CQ.type === remarkType)
            const commQuestAll = allComments?.filter(CQ => CQ.type === remarkType)
            setDisplayComments(commQuestAll)
            setIsLoading(false)
        }
    }, [remarkType, allComments])

    const goToVideo = async (remark) => {
        let res = await getMyVideo('/videos/getVideo', { videoId: remark.videoId })
        if (!res.data.length) {
            return toast.warn(`Hm, it seems this video is no longer available 🤔 `,
                { autoClose: 4000 })
        }
        history.push(`/player?video=${res.data[0].videoId}&startAt=${Math.floor(remark.pauseTime)}`)
    }

    return (
        // <Card className='profile-card'>
        //     <Card.Body className='profile-card-body'>
                <div className='profile-display-comments'>{console.log(remarkType)}
                    {/* <Nav className='remarks-nav' justify defaultActiveKey={remarkType}>
                        <Nav.Link className={remarkType === 'All' ? 'remarks-nav-active-tab' : 'remarks-nav-tab'} eventKey='All' onSelect={() => setRemarkType('All')}>All</Nav.Link>
                        <Nav.Link className={remarkType === 'Comment' ? 'remarks-nav-active-tab' : 'remarks-nav-tab'} eventKey='Comment' onSelect={() => setRemarkType('Comment')}>Comments</Nav.Link>
                        <Nav.Link className={remarkType === 'Question' ? 'remarks-nav-active-tab' : 'remarks-nav-tab'} eventKey='Question' onSelect={() => setRemarkType('Question')}>Questions</Nav.Link> */}
                        {/* <Nav.Link eventKey='Feedback' onSelect={() => setRemarkType('Feedback')}>Feedbacks</Nav.Link> */}
                    {/* </Nav> */}
                    {remarkType !== 'Feedback' &&
                        <ListGroup variant='flush' className='remarks-list'>
                            <div className='profile-comment-map profile-scrollable'>
                                {isLoading && <ListLoader />}
                                {!displayComments.length && !isLoading
                                    ?
                                    <small>{userHandle} has no {remarkType === 'All' ? 'Comments or Question' : remarkType}s yet</small>
                                    : displayComments.map((remark, i) => {
                                        return (
                                            <ListGroup.Item
                                                className='remark-listItem'
                                                key={remark.commentId}
                                                onClick={() => goToVideo(remark)}
                                            >
                                                <i className='fa fa-play-circle-o profile-sidebar-icon' />{'  '}
                                               {remark.vidData?.title||'Unknown'} 
                                                <br></br>
                                                <small>{remark.text.substring(0, 50)}...</small>
                                                <br /><small className='text-muted'>{DateTime.fromMillis(parseInt(remark?.addedAt)).toRelative()}</small>
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
                                    {remark.type === 'positive'
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
           // {/* </Card.Body>
      //  </Card> */}
    )
}
export default DisplayUserComments;
