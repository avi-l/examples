import React from 'react';
import { Image } from 'react-bootstrap';

const DisplayTypingBubble = (props) => {
    const { currentChatter } = props
    const blankAvatar = '/images/blank-profile-picture-973460_960_720.png';

    return (
        <>
            {currentChatter && <Image roundedCircle className='circle typingImg'
                src={currentChatter?.avatar || blankAvatar}
                alt={currentChatter?.userHandle} />}
            <div className='typing'>
                <div className='typing__dot'></div>
                <div className='typing__dot'></div>
                <div className='typing__dot'></div>
            </div>
        </>
    )
}
export default DisplayTypingBubble;