import React from 'react'
import ContentLoader from 'react-content-loader'
import { Col, Container, Row } from 'react-bootstrap';

export const ConvLoader = (props) => {
  return (
    <>
      <ContentLoader
        speed={2}
        width={140}
        height={50}
        viewBox='0 0 140 50'
        backgroundColor='#f3f3f3'
        foregroundColor='#ecebeb'
        {...props}
      >
        <circle cx='30' cy='30' r='20' />
        <rect x='60' y='20' rx='3' ry='3' width='88' height='8' />
        <rect x='60' y='30' rx='3' ry='3' width='52' height='6' />
      </ContentLoader>
    </>
  )
}

export const MsgLoader = (props) => {
  return (
    <>
      <ContentLoader
        speed={1}
        width={600}
        height={400}
        viewBox='0 0 600 400'
        backgroundColor='#f3f3f3'
        foregroundColor='#ecebeb'
        {...props}
      >
        <circle cx='39' cy='57' r='20' />
        <rect x='37' y='87' rx='6' ry='6' width='220' height='35' />
        <circle cx='514' cy='140' r='22' />
        <rect x='300' y='170' rx='5' ry='5' width='221' height='35' />
        <circle cx='39' cy='224' r='20' />
        <rect x='37' y='254' rx='6' ry='6' width='220' height='35' />
        <circle cx='514' cy='301' r='22' />
        <rect x='300' y='331' rx='5' ry='5' width='221' height='35' />
      </ContentLoader>
    </>
  )
}

export const MessengerLoader = () => {
  return (
    <>
      <Container>
        <Row>
          <Col>
            <Row xs={3}>
              <ConvLoader />
            </Row>
          </Col>
          <Col xs={6}>
            <MsgLoader />
          </Col>
          <Col>
          </Col>
        </Row>
      </Container>
    </>
  )
}