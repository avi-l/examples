import React from 'react';
import { ListGroup } from 'react-bootstrap';
import { ConvLoader } from '../../shared/Loaders';
import Conversations from './Conversations';

const DisplayConversationMenu = (props) => {
    const { conversationData, onSelectConversation, loggedInUserId } = props;

    if (!onSelectConversation) {
        return (
            <>
                <ListGroup className='chatMenuListgroup' >
                    {/* <ListGroup.Item className='chatMenuList'>
                        No Conversations yet!
                    </ListGroup.Item> */}
                    {[...Array(10).keys()].map((i) => (
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