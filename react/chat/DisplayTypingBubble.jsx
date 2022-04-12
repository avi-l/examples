import React from 'react';
import { Image } from 'react-bootstrap';

const DisplayTypingBubble = (props) => {
    const { currentChat } = props
    
    
    return (
        <>
            {currentChat && <Image roundedCircle className='circle typingImg'
                src={currentChat?.avatar || process.env.REACT_APP_BLANK_USER_AVATAR}
                onError={({ currentTarget }) => {
                    currentTarget.onerror = null; // prevents looping
                    currentTarget.src = process.env.REACT_APP_BLANK_USER_AVATAR;
                  }}
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