import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './chatOnline.css'

const ChatOnline = ({ onlineUsers, loggedInUser, setCurrentChat }) => {
    const [onlineFriends, setOnlineFriends] = useState([])

    useEffect(() => {
        setOnlineFriends(loggedInUser?.following?.filter(f => onlineUsers?.includes(f)))
    }, [onlineUsers])

    const handleClick = async (user) => {
        try {
          const res = await axios.get(
            `/conversations/find/${loggedInUser.userId}/${user}`
          );
          setCurrentChat(res.data);
        } catch (err) {
          console.log(err);
        }
      };
      
    return (
        <>
            <div className='chatOnline'>
                {onlineFriends.map(o => (
                    <div className='chatOnlineFriend' onClick={() => handleClick(o)}>
                    <div className='chatOnlineImgContainer'>
                        <img
                            className='chatOnlineImg'
                            src={o.avatar}
                            alt={o?.userHandle} />
                        <div className='chatOnlineBadge'></div>
                    </div>
                    <span className='chatOnlineName'>{o?.userHandle}</span>

                </div>
                ))}
            </div>
        </>
    );
}
export default ChatOnline;