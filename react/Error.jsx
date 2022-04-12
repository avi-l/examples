import React from 'react';
import { Button, Card, Col, Container, Row } from 'react-bootstrap';
import { forceReload } from '../../utilities/forceReload';
import queryString from 'query-string';
import { useHistory } from 'react-router-dom';
import './error.css'

const Error = (props) => {
 
    const history = useHistory()
    const urlSearchParams = queryString.parse(history.location.search);
    const errorCode  = props.errorCode || urlSearchParams._id 
    let bgImg;
    let message;
    switch (errorCode) {
        case '500':
            bgImg = {
                backgroundImage: `url(${process.env.REACT_APP_ERROR_PAGE_500_BG_IMG})`,
            };
            message = 'Hm..we seem to be unable to reach the backend'
            break;
        case '404':
            bgImg = {
                backgroundImage: `url(${process.env.REACT_APP_ERROR_PAGE_404_BG_IMG})`,
            };
            message = 'Hm..that page does not exist.'
            break;
        default:
            bgImg = {
                backgroundImage: `url(${process.env.REACT_APP_ERROR_PAGE_404_BG_IMG})`,
            };
            message = 'Hm..something went wrong.'
            break;
    }

    return (
        <div className='error-page' style={bgImg} >
            <Container fluid className='error-page-container'>
                <Row>
                    <Col>
                        <Card className='error-page-card' title='Go Home'>
                            <Card.Body className='error-page-card-text'>
                                {message}
                            </Card.Body>
                        </Card>
                        <Card.Footer className='error-page-card-footer'>
                            <Button className='error-page-card-btn' variant='outline-primary'
                                onClick={() => forceReload('/')}>K.. let me try the home page again</Button>
                        </Card.Footer>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default Error;
