import React, { useEffect, useState } from 'react';
import { Card, Col, Container, Image, ListGroup, Row } from 'react-bootstrap';
import { topics } from './staticContent'

const Topics = () => {

    return (
        <>
            {
                topics.map((i, k) => (
                    <Card key={k} className='topics-card'>
                        <Image roundedCircle className='topics-avatar'
                            src={`https://picsum.photos/seed/${k+10}/65` ?? process.env.REACT_APP_BLANK_VIDEO_PIC} />
                        <Card.Body>
                            <Card.Subtitle>{i.title}</Card.Subtitle>
                            <Card.Text>Channels: {Math.floor(Math.random() * (35 - 2) + 2)}</Card.Text>
                        </Card.Body>
                    </Card>
                ))}
        </>
    );
};

export default Topics;