import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card'
import './UserCard.css'
import { setUserProfileData } from '../userManagement';
import { Button, Image } from 'react-bootstrap';
import Loading from '../../shared/Loading';
import { getUserComments, getUserFeedbacks, getUserReps } from '../user_api';

const UserCard = (props) => {
    const { cardUserId, loggedInUserId, action } = props
    const [isLoading, setIsLoading] = useState();
    const [commCount, setCommCount] = useState('');
    const [repCount, setRepCount] = useState('');
    const [feedbacks, setFeedbacks] = useState({});
    const [cardUser, setCardUser] = useState({});

    useEffect(() => {
        setIsLoading(true)
        setCardUser({ userId: cardUserId })
        if (cardUser.userId) {
            setUserProfileData(cardUser, setCardUser, false)
                .then((res) => {
                    if (!res) {
                        setIsLoading(false)
                        return console.log("User not found")
                    }
                    else if (res.error) {
                        setIsLoading(false)
                        return console.log(res.error)
                    }
                    getUserReps({ userId: cardUser.userId, countOnly: true })
                        .then(res => setRepCount(res.data))
                        .catch(err => console.log(err))
                    getUserComments({ userId: cardUser.userId, countOnly: true })
                        .then(res => setCommCount(res.data))
                        .catch(err => console.log(err))
                    getUserFeedbacks({ userId: cardUser.userId })
                        .then(res => {
                            setFeedbacks({
                                upCount: res.data.filter(F => F.deleted === 0 && F.type === 'thumbsUp').length,
                                downCount: res.data.filter(F => F.deleted === 0 && F.type === 'thumbsDn').length
                            })
                        })
                        .catch(err => console.log(err))
                    setIsLoading(false)
                })
                .catch(err => console.log(err))
        }
    }, [cardUser.userId])

    if (isLoading) {
        return (
            <Card className="user-card">
                <Card.Body className="user-card-body">
                    <div className="user-card-loading"><Loading /></div>
                </Card.Body>
            </Card>

        )
    }
    return (
        <Card className="user-card">
            <Card.Body className="user-card-body">
                <Image className="user-card-avatar" roundedCircle thumbnail src={cardUser?.avatar}
                    alt={cardUser?.userHandle} />
                <Card.Text className="user-card-text-userhandle">
                    {cardUser?.userHandle}
                </Card.Text>
                <Card.Text className="user-card-text-name">
                    {cardUser?.firstName}{'  '}{cardUser?.lastName}
                </Card.Text>
                <Card.Text className="user-card-text-name">
                    Followers: {cardUser?.followers?.length}{'  '}
                    Following: {cardUser?.following?.length}
                </Card.Text>
                <Card.Text className="user-card-text-name">
                    Reputations: {repCount}{'  '}
                    Comments: {commCount}
                </Card.Text>
                <Card.Text className="user-card-text-name">
                    Feedbacks: {'  '}
                    <i className='far fa-thumbs-up user-card-icons' />{feedbacks.upCount}{'  '}
                    <i className='far fa-thumbs-down user-card-icons' />{feedbacks.downCount}
                </Card.Text>
                {cardUser.followers?.find(val => val.userId === loggedInUserId)
                    ? <Button
                        variant="primary"
                        className="search-users-follow-btn"
                        onClick={() => {
                            action('/users/unfollow', cardUser)
                        }}>Following</Button>
                    : <Button
                        variant="outline-primary"
                        className="search-users-follow-btn"
                        onClick={() => {
                            action('/users/follow', cardUser)
                        }}>Follow</Button>
                }
            </Card.Body>
        </Card>
    )
}

export default UserCard;