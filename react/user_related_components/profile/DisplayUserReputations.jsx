import React, { useEffect, useState } from 'react'
import { getUserReps } from '../user_api'
import Loading from '../../shared/Loading';
import { ProgressBar } from 'react-bootstrap';

const DisplayUserReps = (props) => {
    const { userId, userHandle } = props
    const [reps, setReps] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        getUserReps({ userId, limit: 35 })
            .then(res => {
                setReps(res.data)
                setIsLoading(false)
            })
            .catch(err => {
                console.log(err)
                setIsLoading(false)
            })
    }, [userId])

    if (isLoading) {
        return (
            <div className="loading" style={{ textAlign: "center" }}> <Loading /></div>
        )
    }
    return (
        <div className="profile-rep-map profile-scrollable">
            {!reps.length && !isLoading ? <small>{userHandle} has no reputations yet</small>
                : reps.map((val, key) => {
                    return (
                        <div key={key} ><span className="material-icons text-info mr-2" style={{ fontSize: "18px" }}>
                            ondemand_video
                        </span>{'  '}
                            <small>{val.channelInfo[0]?.title} Channel</small>
                            <ProgressBar variant="info" now={val.reputation} label={val.reputation} />
                        </div>
                    )
                })
            }
        </div>
    )
}
export default DisplayUserReps;