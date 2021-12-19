import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { ConvLoader } from '../Loaders';
import Conversations from './Conversations';

const DisplayConversationMenu = (props) => {
    const { conversationData, onSelectConversation, loggedInUserId } = props;
    // console.log(conversationData)
    if (!conversationData.length) {
        return (
            <>
                <ListGroup className='chatMenuListgroup' >
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <ListGroup.Item
                            key={i}
                            className='chatMenuList'>
                            <ConvLoader />
                        </ListGroup.Item>
                    ))
                    }
                </ListGroup>
            </>
        )
    }
    return (
        <>
            <ListGroup className='chatMenuListgroup' >
                {conversationData?.map((c) => (
                    <ListGroup.Item
                        className='chatMenuList'
                        key={c.timestamp}
                        action
                        onClick={() => onSelectConversation(c)}>
                        <Conversations conversationData={c} loggedInUserId={loggedInUserId} />
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </>
    )
}
export default DisplayConversationMenu;