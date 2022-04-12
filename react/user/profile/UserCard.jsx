import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card'
import './UserCard.css'
import { Button, Col, Container, Image, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { amIfollowing, followUnfollowUser, getUserStats } from '../user_api';
import { UserCardLoader } from '../../shared/Loaders';
import { useHistory } from 'react-router-dom';

const UserCard = (props) => {
    const { cardUserId, loggedInUserId, cssClass } = props
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const [cardUser, setCardUser] = useState({});
    const { userHandle, avatar, firstName, lastName,
    } = cardUser;
    const history = useHistory()

    useEffect(() => {
        if (cardUserId) {
            (async () => {
                await Promise.allSettled([
                    getUserStats({ userId: cardUserId }),
                    amIfollowing('/follows/amIfollowing', { follower: loggedInUserId, following: cardUserId })
                ]).then(res => {
                    console.log(res)

                    setCardUser(res[0].status === 'fulfilled' ? res[0].value.data[0] : '')
                    setIsFollowing(res[1].status === 'fulfilled' ? res[1].value.data : false)

                    setIsLoading(false)
                }).catch(error => toast.error(`Backend Error: ${error}`))
            })();
        }
    }, [cardUserId, loggedInUserId])

    const followUnfollow = async () => {
        try {
            const route = isFollowing ? '/follows/unfollow' : '/follows/follow'
            setIsSaving(true)
            const res = await followUnfollowUser(route, { following: cardUserId, follower: loggedInUserId })
            if (res.status !== 200) return toast.error(res.statusText)
            setIsFollowing(prev => !prev)
            setCardUser(prev => ({
                ...prev,
                userResources: {
                    ...prev.userResources,
                    totalFollowers: isFollowing 
                    ? prev.userResources.totalFollowers -1
                    : prev.userResources.totalFollowers +1
                }
            }))
        } catch (error) {
            toast.error(`${error}: Backend Error`)
        }
        finally { setIsSaving(false) }
    }

    if (isLoading) {
        return (
            <Card className={cssClass ? `user-card ${cssClass}` : 'user-card'}>
                <Card.Body className='user-card-body'>
                    <UserCardLoader />
                </Card.Body>
            </Card>
        )
    }
    return (
        <Card className={cssClass ? `user-card ${cssClass}` : 'user-card'}>
            <Card.Header className='user-card-header'
                onClick={() => history.push('/profile/?_id=' + cardUserId)}>
                <Image className='user-card-avatar' roundedCircle
                    src={avatar || process.env.REACT_APP_BLANK_USER_AVATAR}
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null; // prevents looping
                        currentTarget.src = process.env.REACT_APP_BLANK_USER_AVATAR;
                    }}
                    alt={userHandle} />
                <Card.Text className='user-card-userhandle'>
                    {userHandle}
                </Card.Text>
                <Card.Text className='user-card-name'>
                    {firstName || <i className="far fa-smile user-card-icons" />}{'  '}
                    {lastName || <i className="far fa-smile user-card-icons" />}
                </Card.Text>
            </Card.Header>
            <Card.Body className='user-card-body'>
                <Container className='user-card-stats-container'>
                    <Row className='user-card-stats-row'>
                        <Col className='user-card-stats-col'>{cardUser.userResources.totalFollowers ?? 0} <br />
                            <i className='fas fa-users user-card-icons' title='Followers' />
                        </Col>
                        <Col className='user-card-stats-col'>{cardUser.userResources.totalReputations ?? 0} <br />
                            <i className='fas fa-balance-scale user-card-icons' title='Reputations' />
                        </Col>
                        <Col className='user-card-stats-col'>{cardUser.userResources.totalFollowing ?? 0} <br />
                            <i className='fas fa-walking user-card-icons' title='Following' />
                        </Col>
                    </Row>
                    <Row className='user-card-stats-row'>
                        <Col className='user-card-stats-col'>{cardUser.userResources.totalComments ?? 0 + cardUser.userResources.totalReplies ?? 0} <br />
                            <i className='far fa-comment-alt user-card-icons' title={`${cardUser.userResources.totalComments ?? 0} Comments / ${cardUser.userResources.totalReplies ?? 0} Replies`} />
                        </Col>
                        <Col className='user-card-stats-col '>{cardUser.userResources.totalPosFeedbacks ?? 0} <br />
                            <i className='far fa-thumbs-up user-card-icons' title='Positive Feedback' />
                        </Col>
                        <Col className='user-card-stats-col '>{cardUser.userResources.totalNegFeedbacks ?? 0} <br />
                            <i className='far fa-thumbs-down user-card-icons' title='Negative Feedback' />
                        </Col>
                        <Col className='user-card-stats-col '> {cardUser.userResources.totalSubscriptions ?? 0}<br />
                            <i className='far fa-bookmark user-card-icons' title='Subscriptions' />
                        </Col>
                    </Row>
                </Container>
            </Card.Body>
            {cardUserId !== loggedInUserId && loggedInUserId &&
                <Card.Footer className='user-card-footer'>
                    <Row className='user-card-stats-row'>
                        {isSaving ?
                            <Button size='sm' variant='outline-dark'
                                className='user-card-follow-btn'>
                                <><i className='far fa-save user-card-follow-icon' title='unfollow' />Saving..</>
                            </Button>
                            : <Button size='sm' variant='outline-dark'
                                disabled={isSaving}
                                className='user-card-follow-btn' onClick={() => followUnfollow()}>
                                {isFollowing
                                    ? <><i className='fas fa-user-minus user-card-follow-icon' title='unfollow' />Unfollow</>
                                    : <><i className='fas fa-user-plus user-card-follow-icon' title='follow' />Follow</>
                                }
                            </Button>
                        }
                        <Button size='sm' variant='outline-dark'
                            className='user-card-follow-btn' onClick={() => {
                                history.push('/chat/?friend=' + cardUserId)
                            }}
                        ><i className='far fa-comment-dots user-card-follow-icon' />Message</Button>
                    </Row>
                </Card.Footer>
            }
        </Card>
    )
}
export default UserCard;