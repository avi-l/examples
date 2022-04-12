import React from 'react'
import ContentLoader from 'react-content-loader'
import { Col, Container, Row } from 'react-bootstrap';
import { Instagram } from 'react-content-loader'

export const HomePageLoader = props => {
  // Get values from props
  // const { rows, columns, coverHeight, coverWidth, padding, speed } = props;

  // Hardcoded values
  const rows = 2
  const columns = 5
  const coverHeight = 65
  const coverWidth = 65
  const padding = 5
  const speed = 1

  const coverHeightWithPadding = coverHeight + padding
  const coverWidthWithPadding = coverWidth + padding
  const initial = 35
  const covers = Array(columns * rows).fill(1)

  return (
    <ContentLoader
      speed={speed}
      viewBox="-25 -20 400 300"
      backgroundColor="#d9d9d9"
      foregroundColor="#e3e3e3"
      {...props}
    >
      <rect
        x="0"
        y="0"
        rx="0"
        ry="0"
        width={columns * coverWidthWithPadding - padding}
        height="20"
      />

      {covers.map((g, i) => {
        let vy = Math.floor(i / columns) * coverHeightWithPadding + initial
        let vx = (i * coverWidthWithPadding) % (columns * coverWidthWithPadding)
        return (
          <rect
            key={i}
            x={vx}
            y={vy}
            rx="0"
            ry="0"
            width={coverWidth}
            height={coverHeight}
          />
        )
      })}
    </ContentLoader>
  )
}


export const LoadingIcon = () => {
  return (
    <div className='loading-icon'>
      <i className='fas fa-circle-notch fa-spin' />
    </div>
  )
}
export const TaskList = props => {
  return (
    <ContentLoader
      speed={2}
      width={400}
      height={160}
      viewBox="0 0 400 160"
      backgroundColor="#d9d9d9"
      foregroundColor="#ededed"
      {...props}
    >
      <rect x="20" y="6" rx="4" ry="4" width="360" height="32" />
      <rect x="20" y="55" rx="4" ry="4" width="360" height="32" />
      <rect x="20" y="104" rx="4" ry="4" width="360" height="32" />
    </ContentLoader>
  )
}
export const VideoPlayerHeaderLoader = props => {
  return (
    <ContentLoader
      height={54}
      width={520}
      viewBox="0 0 520 54"
      backgroundColor="#c9c9c9"
      foregroundColor="#ecebeb"
      {...props}
    >
      <circle cx="30" cy="30" r="18" />
      <rect x="53" y="14" rx="3" ry="3" width="180" height="13" />
      <rect x="53" y="30" rx="3" ry="3" width="10" height="10" />
      <rect x="67" y="30" rx="3" ry="3" width="74" height="10" />
      {/* <circle cx="505" cy="27" r="8" /> */}
    
    </ContentLoader>
  )
}

export const FeedPostLoader = () => <Instagram />
export const UserCardLoader = props => {
  return (
    <ContentLoader
      width={460}
      height={275}
      viewBox="0 0 460 275"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      {...props}
    >
      <circle cx="87" cy="63" r="52" />
      <rect x="30" y="134" rx="0" ry="0" width="113" height="14" />
      <rect x="46" y="154" rx="0" ry="0" width="82" height="13" />
      <rect x="28" y="177" rx="0" ry="0" width="123" height="78" />
    </ContentLoader>
  )
}
export const ProfilePageLoader = props => {
  return (
    <ContentLoader
      speed={2}
      width={1200}
      height={650}
      viewBox="0 0 1200 650"
      backgroundColor="#ecebeb"
      foregroundColor="#efefef"
      {...props}
    >
      <rect x="0" y="60" rx="2" ry="2" width="204" height="550" />
      <rect x="227" y="60" rx="2" ry="2" width="530" height="401" />
      <rect x="227" y="469" rx="2" ry="2" width="530" height="401" />
      <rect x="782" y="60" rx="2" ry="2" width="300" height="300" />
      <rect x="782" y="380" rx="2" ry="2" width="300" height="300" />
    </ContentLoader>
  )
}
export const ChannelPageLoader = ({
  heading = { width: 140, height: 24 },
  row = 3,
  column = 6,
  width = 1100,
  padding = 8,
  borderRadius = 4,
  ...props
}) => {
  const list = []

  let height

  for (let i = 1; i <= row; i++) {
    const itemWidth = (width - padding * (column + 1)) / column

    const height1 = (itemWidth * 9) / 16

    const height2 = 20

    const height3 = 20

    const headingWidth = heading.width

    const headingHeight = heading.height

    const space =
      padding +
      headingHeight +
      (padding + height1) +
      (padding / 2 + height2) +
      height3 +
      padding * 6

    const yHeading = padding + space * (i - 1)

    list.push(
      <rect
        x={padding}
        y={yHeading}
        rx={0}
        ry={0}
        width={headingWidth}
        height={headingHeight}
      />
    )

    for (let j = 0; j < column; j++) {
      const x = padding + j * (itemWidth + padding)

      const y1 = yHeading + headingHeight + (padding * 3) / 2

      const y2 = y1 + padding + height1

      const y3 = y2 + padding / 2 + height2

      list.push(
        <>
          <rect
            x={x}
            y={y1}
            rx={borderRadius}
            ry={borderRadius}
            width={itemWidth}
            height={height1}
          />
          <rect x={x} y={y2} rx={0} ry={0} width={itemWidth} height={height2} />
          <rect
            x={x}
            y={y3}
            rx={0}
            ry={0}
            width={itemWidth * 0.6}
            height={height3}
          />
        </>
      )

      if (i === row) {
        height = y3 + height3
      }
    }
  }

  return (
    <ContentLoader
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      {...props}
      backgroundColor="#c9c9c9"
      foregroundColor="#ecebeb"
    >
      {list}
    </ContentLoader>
  )
}

export const ListLoader = (props) => (
  <ContentLoader
    speed={2}
    width={340}
    height={200}
    viewBox="0 0 340 200"
    backgroundColor="#c9c9c9"
    foregroundColor="#ecebeb"
    {...props}
  >
    <rect x="15" y="12" rx="3" ry="3" width="230" height="32" />
    <rect x="15" y="52" rx="3" ry="3" width="230" height="32" />
    <rect x="15" y="92" rx="3" ry="3" width="230" height="32" />
    <rect x="15" y="132" rx="3" ry="3" width="230" height="32" />
  </ContentLoader>
)

export const ChannelCardLoader = (props) => {
  return (
    <>
      <ContentLoader
        speed={2}
        width={400}
        height={460}
        viewBox="0 0 400 460"
        backgroundColor="#c9c9c9"
        foregroundColor="#ecebeb"
        {...props}
      >
        <circle cx="91" cy="64" r="53" />
        <rect x="31" y="144" rx="2" ry="2" width="131" height="16" />
        <rect x="32" y="167" rx="2" ry="2" width="131" height="7" />
        <rect x="32" y="177" rx="2" ry="2" width="131" height="7" />
        <rect x="32" y="189" rx="2" ry="2" width="97" height="7" />
      </ContentLoader>
    </>
  )
}
export const ConvLoader = (props) => {
  return (
    <>
      <ContentLoader
        speed={2}
        width={140}
        height={50}
        viewBox='0 0 140 50'
        backgroundColor='#c9c9c9'
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

export const ThreeDotsLoader = (props) => (
  <Container>
    <Row>
      <Col>
        <ContentLoader
          viewBox="0 0 400 160"
          height={160}
          width={400}
          backgroundColor="transparent"
          {...props}
        >
          <circle cx="150" cy="56" r="8" />
          <circle cx="194" cy="56" r="8" />
          <circle cx="238" cy="56" r="8" />
        </ContentLoader>
      </Col>
    </Row>

  </Container>
)

export const MsgLoader = (props) => {
  return (
    <>
      <Container>
        <Row>
          <Col>
          </Col>
          <Col xs={6}>
            <ContentLoader viewBox="0 0 446 160" height={160} width={446} {...props}
              backgroundColor="#c9c9c9"
              foregroundColor="#ecebeb"
            >

              <circle cx="19" cy="25" r="16" />
              <rect x="39" y="12" rx="5" ry="5" width="220" height="10" />
              <rect x="40" y="29" rx="5" ry="5" width="220" height="10" />
              <circle cx="420" cy="71" r="16" />
              <rect x="179" y="76" rx="5" ry="5" width="220" height="10" />
              <rect x="179" y="58" rx="5" ry="5" width="220" height="10" />
              <circle cx="21" cy="117" r="16" />
              <rect x="45" y="104" rx="5" ry="5" width="220" height="10" />
              <rect x="45" y="122" rx="5" ry="5" width="220" height="10" />
            </ContentLoader>
          </Col>
          <Col>
          </Col>
        </Row>
      </Container>
    </>
  )
}