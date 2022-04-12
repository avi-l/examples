import React, { useEffect, useState } from 'react'
import { getUserReps } from '../user_api'
import { Card, ListGroup, Nav, ProgressBar } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { ListLoader } from '../../shared/Loaders';

const DisplayUserReps = (props) => {
    const { userId, userHandle } = props
    const [reps, setReps] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const history = useHistory()

    useEffect(() => {
        (async () => {
            try {
                const res = await getUserReps({ userId, limit: 35 })
                console.log(res.data)
                setReps(res.data)
            } catch (error) {
                console.error(error)
            }
            finally { setIsLoading(false) }
        })();
    }, [userId])

    return (
        // <Card className='profile-card profile-h-100'>
        //     <Card.Body className='profile-card-body'>
                <div className='profile-display-reputations'>
                {/* <Nav className='remarks-nav' justify >
                   <Nav.Link className='remarks-nav-active-tab'>Reputations</Nav.Link> 
                    </Nav> */}
                    <ListGroup variant='flush' className='remarks-list'>
                        <div className='profile-rep-map profile-scrollable'>
                        {isLoading && <ListLoader />}
                            {!reps.length && !isLoading ? <small>{userHandle} has no reputations yet</small>
                                : reps.map((val) => {
                                    return (
                                        <ListGroup.Item
                                            className='remark-listItem '
                                            key={val.reputationId}
                                            onClick={() => history.push(`/channelPage?channel=${val.channelInfo[0]?.channelId}`)}
                                        >
                                            <i className='fas fa-tv profile-sidebar-icon'></i>
                                            {'  '}
                                            <small>{val.channelInfo[0]?.title} Channel</small>

                                            <ProgressBar className='profile-reputation-bar' now={val.reputation} label={parseInt(val.reputation)} />
                                        </ListGroup.Item>
                                    )
                                })
                            }
                        </div>
                    </ListGroup>
                </div>
        //     </Card.Body>
        // </Card>
    )
}
export default DisplayUserReps;