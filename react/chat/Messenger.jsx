import React, { useContext, useEffect, useState, useRef, useReducer, useCallback, useMemo } from 'react';
import Message from './message/Message';
import storeContext from '../../stores/storeContext'
import './messenger.css'
import socket from '../shared/socket'
import { observer } from 'mobx-react';
import { chatGet, chatPost } from './chat_api';
import { isUserLoggedIn, onAuthError } from '../user/userManagement';
import { Button, CloseButton, Col, Container, FormControl, Image, InputGroup, Navbar, Row, Toast } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useHistory, withRouter } from 'react-router-dom';
import queryString from 'query-string';
import StartChatModal from './StartChatModal';
import InfiniteScroll from 'react-infinite-scroll-component';
import DisplayTypingBubble from './DisplayTypingBubble';
import DisplayStartNewChat from './DisplayStartNewChat';
import DisplayEmojiPicker from './DisplayEmojiPicker';
import DisplayConversationMenu from './conversations/DisplayConversationMenu';
import { MsgLoader } from './Loaders';
import UserCardModal from './UserCardModal';
import { reducer } from './reducers/useReducer';

const Messenger = observer(props => {
    const urlSearchParams = queryString.parse(props.location.search);
    const newChatUserId = urlSearchParams._id;
    const initialState = {
        isLoading: true,
        lastPosition: 0,
        hasMoreMsgs: true,
        conversationData: {},
        currentChat: '',
        quotedMessageId: '',
        quotedMessageUserHandle: '',
        quotedMessageText: '',
        messages: [],
        typing: { showDots: false, senderId: '' },
    }
    const [state, dispatch] = useReducer(reducer, initialState);
    const { isLoading, lastPosition, hasMoreMsgs, conversationData, quotedMessageUserHandle,
        currentChat, quotedMessageId, quotedMessageText, messages, typing: { showDots } } = state;
    const [newMessage, setNewMessage] = useState('');
    const store = useContext(storeContext);
    const { userStore, modalStore } = store;
    const { user, setUser } = userStore;
    const { userId } = user;
    const { setShowStartChatModal, setShowUserCardModal } = modalStore;
    const history = useHistory();
    const newMsgRef = useRef();
    const chatBottomRef = useRef();
    const scrollUpRef = useRef();
    const typingScrollRef = useRef();
    const emojiRef = useRef();
    const replyRef = useRef();
    const SCROLL_STYLE = {
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
    };
    const blankAvatar = '/images/blank-profile-picture-973460_960_720.png';
    const CHAT_ROUTES = useMemo(() => ({
        newConversation: '/conversation/newConversation',
        getConversations: '/conversation/getConversation',
        getMessages: '/message/getMessage',
        sendMessage: '/message/sendMessage',
        deleteMessage: '/message/deleteMessage',
    }), [])

    useEffect(() => {
        (async () => {
            const res = await isUserLoggedIn(false)
            if (!res.attributes?.sub) return onAuthError()
            if (userId && userId === res.attributes.sub) {
                dispatch({ type: 'loading', payload: false })
                try {
                    const { getConversations } = CHAT_ROUTES;
                    const conv = await chatGet(getConversations, { userId })
                    const userData = conv.data?.map((c) => {
                        const timestamp = c.timestamp
                        const conv_id = c._id
                        const friendData = c.userData.find(u => u.userId !== userId)
                        return { ...friendData, timestamp, conv_id }
                    })
                    dispatch({ type: 'conversationData', payload: userData })
                } catch (error) {
                    return toast.error(`Unable to get conversations: ${error}`)
                }
            }
        })();
    }, [CHAT_ROUTES, userId])

    useEffect(() => {
        socket.on('getMessage', (data) => {
            dispatch({ type: 'newMessage', payload: data })
            dispatch({ type: 'typing', payload: { showDots: false } })
        })
        socket.on('deleteMessage', (data) => {
            dispatch({ type: 'deleteMessage', payload: data.messageId })
        })
        socket.on('userStartedTyping', (data) => {
            dispatch({ type: 'typing', payload: { showDots: true, senderId: data.senderId } })
        })
        socket.on('userStoppedTyping', (data) => {
            dispatch({ type: 'typing', payload: { showDots: false, senderId: data.senderId } })
        })
    }, []);

    const fetchMessages = useCallback(async () => {
        if (currentChat) {
            try {
                const perPage = 25;
                const { getMessages } = CHAT_ROUTES;
                const res = await chatGet(getMessages, {
                    conversationId: currentChat.conv_id,
                    receiverId: userId,
                    senderId: currentChat.userId,
                    skip: lastPosition,
                    limit: perPage,
                })
                // console.log(res.data)
                if (!res.data) dispatch({ type: 'hasMoreMsgs', payload: false })
                else {
                    const type = !messages?.length ? 'messages' : 'addMsgsToTop';
                    dispatch({ type, payload: res.data.messages.sort((a, b) => a.timestamp - b.timestamp) })
                    dispatch({ type: 'hasMoreMsgs', payload: res.data.totalMsgs > lastPosition })
                }
                dispatch({ type: 'setLastPosition', payload: perPage })
            } catch (error) {
                return toast.error(`Unable to get messages: ${error}`)
            }
        }
        else dispatch({ type: 'hasMoreMsgs', payload: false })
    }, [CHAT_ROUTES, currentChat, lastPosition, messages.length, userId])

    const fetchMessagesRef = useRef(fetchMessages);
    useEffect(() => {
        fetchMessagesRef.current = fetchMessages;
    }, [fetchMessages]);

    useEffect(() => {
        fetchMessagesRef.current();
    }, [currentChat]);

    const getChatDetails = async (c) => {
        dispatch({ type: 'resetChatBox' })
        dispatch({ type: 'setCurrentChat', payload: c })
        const chatterId = c.userId;
        setUser({ ...user, unreadMsgsUserIds: user.unreadMsgsUserIds?.filter(u => u !== chatterId) })
        history.push('/chat')
    }
    const populateNewChat = useCallback(async () => {
        try {
            const { newConversation } = CHAT_ROUTES;
            const res = await chatPost(newConversation, { senderId: userId, receiverId: newChatUserId })
            dispatch({ type: 'resetChatBox' })
            dispatch({ type: 'newConversation', payload: res.data })
            dispatch({ type: 'setCurrentChat', payload: res.data })
            history.push('/chat')
        } catch (error) {
            return toast.error(`Unable to start conversations: ${error}`)
        }
    }, [CHAT_ROUTES, history, newChatUserId, userId])

    useEffect(() => {
        newChatUserId && userId && populateNewChat()
    }, [newChatUserId, populateNewChat, userId]);

    useEffect(() => {
        const receiverId = currentChat.userId
        const startStop = newMessage ? 'userStartedTyping' : 'userStoppedTyping'
        socket.emit(startStop, {
            senderId: userId,
            receiverId
        })
    }, [currentChat.userId, newMessage, userId])

    useEffect(() => {
        const SCROLL_STYLE = {
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start'
        };
        setTimeout(() => {
            lastPosition && scrollUpRef.current.scrollIntoView({ SCROLL_STYLE });
            newMsgRef.current && newMsgRef.current.scrollIntoView({ SCROLL_STYLE });
        }, 300)
    }, [messages, lastPosition]);

    useEffect(() => {
        const SCROLL_STYLE = {
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start'
        };
        showDots && typingScrollRef.current.scrollIntoView({ SCROLL_STYLE });
        newMessage && emojiRef.current.scrollIntoView({ SCROLL_STYLE });
    }, [showDots, newMessage]);
    
    useEffect(() => {
        const SCROLL_STYLE = {
            behavior: 'smooth',
            block: 'nearest',
            inline: 'start'
        };
        quotedMessageText && replyRef.current.scrollIntoView({ SCROLL_STYLE });
    }, [quotedMessageText]);

    const onSelectConversation = (c) => {
        setShowUserCardModal({ show: false, cardUserId: '', loggedInUserId: '' })
        setShowStartChatModal(false)
        socket.emit('markMsgsRead', {
            senderId: userId,
            receiverId: c.userId
        })
        if (c.userId === currentChat?.userId) {
            setUser({ ...user, unreadMsgsUserIds: user.unreadMsgsUserIds.filter(u => u !== currentChat?.userId) })
            return;
        }
        else getChatDetails(c)
    }

    const onCloseCurrentChat = () => {
        socket.emit('markMsgsRead', {
            senderId: userId,
            receiverId: ''
        })
        dispatch({ type: 'resetChatBox' })
        setShowUserCardModal({ show: false, cardUserId: '', loggedInUserId: '' })
    }

    const handleDeleteMessage = async (message) => {
        try {
            const { deleteMessage } = CHAT_ROUTES;
            await chatPost(deleteMessage, message)
            socket.emit('deleteMessage', {
                receiverId: currentChat.userId,
                messageId: message._id
            })
            dispatch({ type: 'deleteMessage', payload: message._id })
        } catch (error) {
            return toast.error(`Unable to delete: ${error}`)
        }
    }
    const handleReplyMessage = async (message, quotedMessageUserHandle) => {
        dispatch({ type: 'setQuotedMessage', payload: { message, quotedMessageUserHandle } })
    }
    const displayReplyToast = () => {
        return (
            <div className='replyQuoteToast' ref={replyRef}>
                <Toast className='replyQuoteWrapper'
                    animation={false}
                    show={quotedMessageText}
                    onClose={handleCancelReply}>
                    <Toast.Body >
                        <Row className='replyQuoteUserHandle'>
                            <Col >
                                {quotedMessageUserHandle}
                            </Col>
                            <Col sm={4} className='replyQuoteCloseX'>
                                <i className="fas fa-times"
                                    onClick={() => handleCancelReply()} /></Col>
                        </Row>
                        <div className='replyQuoteText'>
                            <Row>
                                <Col sm={8} >{quotedMessageText}</Col>
                            </Row>
                        </div>
                    </Toast.Body>
                </Toast>
            </div>
        )
    }
    const handleCancelReply = () => {
        dispatch({ type: 'clearQuotedMessage' })
    }

    const handleSubmit = async () => {
        try {
            const { sendMessage } = CHAT_ROUTES;
            const timestamp = Date.now()
            const message = {
                senderId: userId,
                receiverId: currentChat?.userId,
                text: newMessage,
                conversationId: currentChat?.conv_id,
                quotedMessageId: quotedMessageId || '',
                timestamp
            }
            await chatPost(sendMessage, message)
            const replyQuoteText = { text: quotedMessageText}
            const replyQuoteUserDetails = { userHandle: quotedMessageUserHandle}
            const displayMsgObj = { ...message, replyQuoteText, replyQuoteUserDetails }
            dispatch({ type: 'newMessage', payload: displayMsgObj })
            setNewMessage('');
            dispatch({ type: 'clearQuotedMessage' })
            socket.emit('sendMessage', {
                senderId: userId,
                receiverId: currentChat?.userId,
                text: newMessage,
                timestamp
            })
        } catch (error) {
            return toast.error(`Unable to send message: ${error}`)
        }
    }

    if (isLoading) return <div style={{ marginTop: 150 }}><MsgLoader /></div>

    return (
        <>
            <StartChatModal />
            <UserCardModal />
            <Container className='chatContainer'>
                <Row>
                    <Col xs={3} className='chatMenu'>
                        <Row className='chatMenuHeader'>
                            <Col sm={2} className='chatMenuHeaderIcon'><i className='far fa-comments fa-lg' /></Col>
                            <Col sm={3} className='chatMenuHeaderText'>Conversations</Col>
                        </Row>
                        <div className='chatMenuWrapper'>
                            <DisplayConversationMenu
                                conversationData={conversationData}
                                onSelectConversation={onSelectConversation}
                                loggedInUserId={userId}
                            />
                        </div>
                    </Col>
                    <Col>
                        <div className='chatBox'>
                            <div className='chatBoxWrapper'>
                                {!currentChat
                                    ? <DisplayStartNewChat />
                                    : <>
                                        <Navbar bsPrefix='chatBoxHeader'>
                                            <div className='chatBoxHeaderClose'>
                                                <CloseButton variant='white'
                                                    onClick={() => onCloseCurrentChat()} />
                                            </div>
                                            <div className='chatBoxHeaderOnClick'
                                                onClick={() => setShowUserCardModal({
                                                    show: true, cardUserId: currentChat?.userId, loggedInUserId: userId
                                                })}>
                                                <Image
                                                    className='chatBoxHeaderImg'
                                                    src={currentChat?.avatar || blankAvatar}
                                                    alt={currentChat?.userHandle} />
                                                <div className='chatBoxHeaderName'>
                                                    {currentChat?.userHandle}
                                                </div>
                                            </div>
                                        </Navbar>
                                        <div className='keep-scrolling chatBoxTop' id='scrollableDiv' >
                                            <InfiniteScroll
                                                className='infiniteScroll'
                                                inverse={true}
                                                hasMore={hasMoreMsgs}
                                                dataLength={messages?.length}
                                                next={fetchMessages}
                                                scrollableTarget='scrollableDiv'
                                                loader={<i className='fas fa-circle-notch fa-spin loading-icon' />}
                                            >
                                                <div className='keep-scrolling' ref={scrollUpRef} >
                                                    {!messages?.length && !currentChat ? <MsgLoader />
                                                        : messages?.map((m, i) => (
                                                            <div className={m?.senderId === userId ? 'messageRow own' : 'messageRow'}
                                                                key={m?._id||i} ref={newMsgRef}>
                                                                <Message
                                                                    message={m}
                                                                    own={m?.senderId === userId}
                                                                    currentChat={currentChat}
                                                                    loggedInUser={user}
                                                                    handleReplyMessage={handleReplyMessage}
                                                                    handleDeleteMessage={handleDeleteMessage} />
                                                            </div>
                                                        ))
                                                    }
                                                    <div ref={chatBottomRef}></div>
                                                </div>
                                            </InfiniteScroll>
                                            {showDots && <div className='chatBoxTopTypingBubble' ref={typingScrollRef}>
                                                <DisplayTypingBubble currentChat={currentChat} />
                                            </div>}
                                        </div>
                                        <div className='displayReplyToast'>
                                            {displayReplyToast()}
                                        </div>
                                        <Navbar fixed='bottom' bsPrefix='chatBoxBottom'>
                                                <InputGroup >
                                                    <DisplayEmojiPicker {...{ newMessage, setNewMessage }} />
                                                    <FormControl onSubmit={handleSubmit}
                                                        ref={emojiRef}
                                                        aria-label='Chat input'
                                                        className='chatMessageInput'
                                                        placeholder='Start typing..'
                                                        onChange={(e) => setNewMessage(e.target.value)}
                                                        onKeyPress={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                                                        value={newMessage}
                                                        aria-describedby='basic-addon2' />
                                                    <Button
                                                        bsPrefix='chatMessageSendBtn'
                                                        disabled={!newMessage}
                                                        variant='outline-secondary'
                                                        id='basic-addon2'
                                                        onClick={handleSubmit}>
                                                        <i className='far fa-paper-plane fa-lg chatMessageIcon' />
                                                    </Button>
                                                    <Button
                                                        className='chatMessageScrollBtn'
                                                        title='Scroll to bottom'
                                                        onClick={() => chatBottomRef.current.scrollIntoView({ SCROLL_STYLE })}>
                                                        <i className='fa fa-angle-double-down chatMessageScrollBtnIcon' />
                                                    </Button>
                                                </InputGroup>
                                         
                                        </Navbar>

                                    </>
                                }
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </>
    );
})
export default withRouter(Messenger);