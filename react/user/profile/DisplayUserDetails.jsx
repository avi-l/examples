import React from 'react'
import { Card, ListGroup } from 'react-bootstrap';

const DisplayUserDetails = (props) => {
    const { profileUser, user } = props;

    return (
        <Card className='userDetails-card'>
            <Card.Body className='profile-card-body'>
                <ListGroup variant='flush'>
                    <ListGroup.Item className='profile-sidebar-listgroup-item'>
                        <i className='fas fa-signature profile-sidebar-icon'></i>
                        {profileUser?.firstName} {profileUser?.lastName}
                    </ListGroup.Item>
                    {profileUser?.userId === user.userId &&
                        <>
                            <ListGroup.Item className='profile-sidebar-listgroup-item'>
                                <i className='fas fa-at profile-sidebar-icon'></i>
                                {profileUser?.userResources?.email}
                            </ListGroup.Item>
                            <ListGroup.Item className='profile-sidebar-listgroup-item'>
                                <i className='fas fa-mobile-alt profile-sidebar-icon'></i>
                                {profileUser?.userResources?.mobilePhone && profileUser?.userResources?.mobilePhone !== 'false' ? profileUser?.userResources?.mobilePhone : '###-###-####'} &nbsp;
                            </ListGroup.Item>
                            <ListGroup.Item className='profile-sidebar-listgroup-item'>
                                <i className='fas fa-home profile-sidebar-icon'></i>
                                {profileUser.userResources?.address1} {profileUser.userResources?.address2} 
                                {profileUser.userResources?.city} {profileUser.userResources?.state} 
                                {profileUser.userResources?.zip} {profileUser.userResources?.country}
                            </ListGroup.Item>
                        </>
                    }
                </ListGroup>
            </Card.Body>
        </Card>
    )
}
export default DisplayUserDetails;
