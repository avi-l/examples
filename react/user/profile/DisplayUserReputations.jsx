import React, { useEffect, useState } from 'react'
import { getUserReps } from '../user_api'
import Loading from '../../shared/Loading';
import { ListGroup, Nav, ProgressBar } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';

const DisplayUserReps = (props) => {
    const { userId, userHandle } = props
    const [reps, setReps] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const history = useHistory()

    useEffect(() => {
        (async () => {
            try {
                const res = await getUserReps({ userId, limit: 35 })
                setReps(res.data)
            } catch (error) {
                console.error(error)
            }
            finally { setIsLoading(false) }
        })();
    }, [userId])

    if (isLoading) {
        return (
            <div className='loading' style={{ textAlign: 'center' }}> <Loading /></div>
        )
    }
    return (
        <div className='profile-display-reputations'>
            <h6 className='d-flex align-items-center profile-mb-3'>
                <i className='fas fa-balance-scale'
                    style={{ marginTop: '7px', marginRight: '.5rem', fontSize: '20px' }}></i>
                <Nav justify variant='tabs' defaultActiveKey={'Reps'}>
                    <Nav.Link eventKey='Reps'>Reputations</Nav.Link>
                </Nav>
            </h6>
            <ListGroup>
                <div className='profile-rep-map profile-scrollable'>
                    {!reps.length && !isLoading ? <small>{userHandle} has no reputations yet</small>
                        : reps.map((val) => {
                            return (
                                <ListGroup.Item
                                    className='reputation-listItem'
                                    key={val._id}
                                    action
                                    onClick={() => history.push(`/channelPage?channel=${val.channelInfo[0]?.title}`)}
                                >
                                    <span className='material-icons text-info mr-2' style={{ fontSize: '18px' }}>
                                        ondemand_video
                                    </span>{'  '}
                                    <small>{val.channelInfo[0]?.title} Channel</small>
                                    <ProgressBar variant='info' now={val.reputation} label={val.reputation} />
                                </ListGroup.Item>
                            )
                        })
                    }
                </div>
            </ListGroup>
        </div>
    )
}
export default DisplayUserReps;