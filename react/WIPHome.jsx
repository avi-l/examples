import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import FeaturedVideos from './FeaturedVideos';
import Topics from './Topics';
import './WIPHome.css'

const Home = () => {

    return (
        <div id="home-page-wrapper" className='home-container'>
            <Container fluid>
                <Row>
                    <Col>
                        <span className='home-header-text'>
                            Categories
                        </span>
                    </Col>
                    <Row noGutters>
                        <Col className='topics-col'>
                            <div className='topics-container'>
                                <Topics />
                            </div>
                        </Col>
                    </Row>
                </Row>
                <Row noGutters>
                    <Col>
                        <span className='home-header-text'>
                            Featured Videos
                        </span>
                    </Col>
                    <Row noGutters>
                        <Col >
                            <div className='featuredVids-parent'>
                                <div className='featuredVids-child'>
                                    <div className='featuredVids-container'>
                                        <FeaturedVideos />
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Row>
            </Container>
        </div>
    );
};

export default Home;