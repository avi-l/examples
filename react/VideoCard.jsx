import React from 'react'
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { DateTime } from 'luxon';
import './VideoCard.css'

const VideoCard = (props) => {
    const { video, action } = props;
    if (!video) return null;

    return (
        <>
            <Card className='video-card'
                onClick={() => action()}>
                <Card.Img className='video-card-thumb' variant='top'
                    src={video.avatar || video.thumb ? video.avatar || video.thumb :
                        `https://i3.ytimg.com/vi${video?.uri?.replace('https://www.youtube.com/watch?v=', '/')}/hqdefault.jpg`}
                
                    alt={video.title}
                />
                <OverlayTrigger
                    key={video._id}
                    id={`tooltip-${video.description}`}
                    placement={'top'}
                    delay='1000'
                    overlay={<Tooltip id={`tooltip-${video.description}`}>
                        {video.description}
                    </Tooltip>}
                >
                    <Card.Body>
                        <Card.Title className='video-card-title' >{video.title}</Card.Title>
                        <Card.Text className='video-card-text' >
                            {video.description}
                        </Card.Text>
                    </Card.Body>
                </OverlayTrigger>
                <div className='video-card-below-body-text'>
                    <Card.Text>
                        <span className='video-card-view-count text-muted'>{video.views ? video.views : 0} {video.views !== 1 ? 'views' : 'view'}</span>
                        <span className='bullet-point text-muted'> • </span>
                        <span className='video-card-uploaded-date text-muted'>{DateTime.fromMillis(parseInt(video?.addedAt)).toRelative()}</span>
                    </Card.Text>
                </div>
            </Card>
        </>
    )
}
export default VideoCard;