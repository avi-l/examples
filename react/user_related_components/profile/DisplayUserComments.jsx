import React, { useEffect, useState } from 'react'
import Nav from 'react-bootstrap/Nav'
import { getUserComments, getUserFeedbacks } from '../user_api'
import { Link } from 'react-router-dom';
import Loading from '../../shared/Loading';

const DisplayUserComments = (props) => {
    const { userId, userHandle } = props;
    const [allComments, setAllComments] = useState([])
    const [feedbacks, setFeedbacks] = useState([])
    const [displayComments, setDisplayComments] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [remarkType, setRemarkType] = useState('Comment')

    useEffect(() => {
        setIsLoading(true)
        getUserComments({ userId, limit: 35 })
            .then(res => setAllComments(res.data))
            .catch(err => console.log(err))
        getUserFeedbacks({ userId })
            .then(res => setFeedbacks(res.data))
            .catch(err => console.log(err))
    }, [userId])

    useEffect(() => {
        const commQuestAll = remarkType === 'All'
            ? allComments
            : allComments?.filter(CQ => CQ.comment[0]?.type === remarkType)
        setDisplayComments(commQuestAll)
        setIsLoading(false)
    }, [remarkType, allComments])

    return (
        <div className="profile-display-comments">
            <h6 className="d-flex align-items-center profile-mb-3">
                <i className="material-icons mr-2" style={{ color: '#3FB8AF' }}>speaker_notes</i>
                <Nav justify variant="tabs" defaultActiveKey={remarkType}>
                    <Nav.Link eventKey="Comment" onSelect={() => setRemarkType('Comment')}>Comments</Nav.Link>
                    <Nav.Link eventKey="Question" onSelect={() => setRemarkType('Question')}>Questions</Nav.Link>
                    <Nav.Link eventKey="Feedback" onSelect={() => setRemarkType('Feedback')}>Feedbacks</Nav.Link>
                    <Nav.Link eventKey="All" onSelect={() => setRemarkType('All')}>All</Nav.Link>
                </Nav>
            </h6>
            {isLoading && <div className="loading" style={{ textAlign: "center" }}> <Loading /></div>}
            {remarkType !== 'Feedback' &&
                <div className="profile-comment-map profile-scrollable">
                    {!displayComments.length && !isLoading
                        ? <small>{userHandle} has no {remarkType === 'All' ? 'Comments or Question' : remarkType}s yet</small>
                        : displayComments.map((val, key) => {
                            return (
                                <div key={key} ><Link to={`/player?playMe=${val.videoUri}`}>
                                    <i className="fa fa-play-circle-o" style={{ color: '#3FB8AF' }} /></Link>{'  '}
                                    <small>{val.userHandle}'s video on {val.channelName} channel</small>
                                    <br></br>
                                    <small><Link to={`/player?playMe=${val.videoUri}`} title={val.comment[0]?.text}>
                                        {val.comment[0]?.text.substring(0, 50)}...</Link></small>
                                </div>
                            )
                        })
                    }
                </div>
            }
            {remarkType === 'Feedback' &&
                <div className="profile-comment-map profile-scrollable">
                    {!feedbacks.length && !isLoading
                        ? <small>{userHandle} has no Feedbacks yet</small>
                        : feedbacks.map((val, key) => {
                            return (
                                <div key={key} >
                                    {val.type === 'thumbsUp'
                                        ? <i className='far fa-thumbs-up' style={{ color: '#3FB8AF', fontSize: "18px" }} />
                                        : <i className='far fa-thumbs-down' style={{ color: '#3FB8AF', fontSize: "18px" }} />
                                    }
                                    <small>{'  '}{val.explanation}...</small>
                                </div>
                            )
                        })
                    }
                </div>
            }
        </div>
    )
}
export default DisplayUserComments;