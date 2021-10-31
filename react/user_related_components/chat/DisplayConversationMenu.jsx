import React from 'react';
import { ListGroup } from 'react-bootstrap';
import Conversations from './conversations/Conversations';

    const DisplayConversationMenu = (props) => {
        const {conversations, onSelectConversation, loggedInUserId} = props;
        return (
            <>
                <ListGroup className='chatMenuListgroup' >
                    {conversations?.map((c) => (
                        <ListGroup.Item
                            className='chatMenuList'
                            key={c._id}
                            action 
                            onClick={() => onSelectConversation(c)}>
                            <Conversations conversation={c} loggedInUserId={loggedInUserId} />
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </>
        )
    }
    export default DisplayConversationMenu;