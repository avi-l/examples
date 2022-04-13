import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Image, ListGroup, Row } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { kFormatter } from '../../utilities/utils';

import { featuredVids } from './staticContent'

const FeaturedVideos = () => {
    const history = useHistory();
    return (
        <>
            {
                featuredVids.map((i, k) => (
                    <Card key={k} className='featuredVids-card'>    
                            <Card.Img className='featuredVids-avatar'
                                src={`https://picsum.photos/seed/${k+1}/350/250` ?? process.env.REACT_APP_BLANK_VIDEO_PIC}>
                            </Card.Img>
                            <div className='featuredVids-avatar-overlay'
                                title='Watch Video'
                                onClick={() => history.push('/player?video=610258559ef14c62298e5129')}
                            >
                            <i className='fas fa-play-circle profile-clickable-icon' />
                            </div>
                    
                        <Card.Body>
                        <Card.Subtitle>{i.title}</Card.Subtitle>
                            <Card.Text>Views: {kFormatter(Math.floor(Math.random() * (33565 - 2) + 2))}</Card.Text>
                        </Card.Body>
                    </Card>
                ))}
        </>
    );
};

export default FeaturedVideos;