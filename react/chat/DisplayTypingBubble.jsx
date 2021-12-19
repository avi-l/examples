import React from 'react';
import { Image } from 'react-bootstrap';

const DisplayTypingBubble = (props) => {
    const { currentChat } = props
    const blankAvatar = '/images/blank-profile-picture-973460_960_720.png';
    
    return (
        <>
            {currentChat && <Image roundedCircle className='circle typingImg'
                src={currentChat?.avatar || blankAvatar}
                alt={currentChat?.userHandle} />}
            <div className='typing'>
                <div className='typing__dot'></div>
                <div className='typing__dot'></div>
                <div className='typing__dot'></div>
            </div>
        </>
    )
}
export default DisplayTypingBubble;