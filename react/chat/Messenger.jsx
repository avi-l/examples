import React, {
    useContext, useEffect, useState,
    useRef, useReducer, useCallback, useMemo
} from 'react';
import Message from './message/Message';
import storeContext from '../../stores/storeContext'
import './messenger.css'
import socket from '../shared/socket'
import { observer } from 'mobx-react';
import { chatGet, chatPost } from './chat_api';
import { isUserLoggedIn, onAuthError } from '../user/userManagement';
import {
    Button, CloseButton, Col, Container, FormControl, Image,
    InputGroup, Navbar, OverlayTrigger, Popover, Row, Toast
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useHistory, withRouter } from 'react-router-dom';
import queryString from 'query-string';
import InfiniteScroll from 'react-infinite-scroll-component';
import DisplayTypingBubble from './DisplayTypingBubble';
import DisplayStartNewChat from './DisplayStartNewChat';
import DisplayEmojiPicker from './DisplayEmojiPicker';
import DisplayConversationMenu from './conversations/DisplayConversationMenu';
import { MsgLoader } from '../shared/Loaders';
import LoadingBar from 'react-top-loading-bar'
import { reducer } from './reducers/useReducer';
import UserCard from '../user/profile/UserCard';
import Error from '../pages/Error';

const Messenger = observer(props => {
    const urlSearchParams = queryString.parse(props.location.search);
    const newChatUserId = urlSearchParams.friend;
    const initialState = {
        isLoading: true,
        lastPosition: 0,
        hasMoreMsgs: true,
        conversationData: [],
        currentChat: '',
        quotedMessageId: '',
        quotedMessageUserHandle: '',
        quotedMessageUserId: '',
        quotedMessageText: '',
        messages: [],
        typing: { showDots: false, senderId: '' },
    }
    const [state, dispatch] = useReducer(reducer, initialState);
    const { isLoading, lastPosition, hasMoreMsgs, conversationData, quotedMessageUserHandle,
        currentChat, quotedMessageId, quotedMessageText, quotedMessageUserId, messages, typing: { showDots } } = state;
    const [newMessage, setNewMessage] = useState('');
    const [progress, setProgress] = useState(10)
    const store = useContext(storeContext);
    const { userStore } = store;
    const { user } = userStore;
    const { userId } = user;
    const history = useHistory();
    const chatBottomRef = useRef();
    const scrollUpRef = useRef();
    const typingScrollRef = useRef();
    const emojiRef = useRef();
    const replyRef = useRef();
    const SCROLL_STYLE = useMemo(() => ({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
    }), []);
    const CHAT_ROUTES = useMemo(() => ({
        newConversation: '/conversation/newConversation',
        getConversations: '/conversation/getConversation',
        getNotifs: '/notifications/getMyMsgNotifications',
        getMessages: '/message/getMessage',
        sendMessage: '/message/sendMessage',
        deleteMessage: '/message/deleteMessage',
    }), [])

    useEffect(() => {
        (async () => {
            setProgress(prev => prev + 25)
            const res = await isUserLoggedIn(true)
            if (!res.attributes?.sub) return onAuthError()
        })()
    }, [])

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const { getConversations, getNotifs } = CHAT_ROUTES;
                setProgress(prev => prev + 5)
                await Promise.allSettled([
                    chatGet(getConversations, { userId }),
                    chatGet(getNotifs, { userId })
                ]).then(res => {
                    const userData = res[0].status === 'fulfilled' ? res[0].value.data?.map((c) => {
                        const timestamp = c.timestamp
                        const conversationId = c.conversationId
                        const friendData = c.userData.find(u => u.userId !== userId)
                        const notifs = res[1].status === 'fulfilled' ? res[1].value.data : 0
                        return { ...friendData, timestamp, conversationId, notifs }
                    }) : 0
                    dispatch({ type: 'conversationData', payload: userData })
                    setProgress(100)
                    dispatch({ type: 'loading', payload: false })
                }).catch(error => toast.error(`${error}: Backend Error`))
            } catch (error) {
                return toast.error(`Unable to get conversations: ${error}`)
            }
        }
        userId && fetchConversations()
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
    }, [SCROLL_STYLE]);

    const fakeProgress = () => {
        setProgress(10)
        setTimeout(() => { setProgress(30) }, 200)
        setTimeout(() => { setProgress(100) }, 300)
    }

    const fetchMessages = useCallback(async () => {
        if (currentChat) {
            try {
                setProgress(prev => prev + 45)
                const perPage = 10;
                const { getMessages } = CHAT_ROUTES;
                const res = await chatGet(getMessages, {
                    conversationId: currentChat.conversationId,
                    receiverId: userId,
                    senderId: currentChat.userId,
                    skip: lastPosition,
                    limit: perPage,
                })
                if (res.data.messages?.length < perPage) dispatch({ type: 'hasMoreMsgs', payload: false })
                const type = !messages?.length ? 'messages' : 'addMsgsToTop';
                dispatch({ type, payload: res.data.messages.sort((a, b) => a.timestamp - b.timestamp) })
                chatBottomRef.current.scrollIntoView({ SCROLL_STYLE })
                dispatch({ type: 'setLastPosition', payload: perPage })
            } catch (error) {
                return toast.error(`Unable to get messages: ${error}`)
            } finally { setProgress(100) }
        }
        else dispatch({ type: 'hasMoreMsgs', payload: false })
    }, [CHAT_ROUTES, SCROLL_STYLE, currentChat, lastPosition, messages?.length, userId])

    const fetchMessagesRef = useRef(fetchMessages);
    useEffect(() => {
        fetchMessagesRef.current = fetchMessages;
    }, [fetchMessages]);

    useEffect(() => {
        fetchMessagesRef.current();
    }, [currentChat]);

    const populateNewChat = useCallback(async () => {
        try {
            const { newConversation } = CHAT_ROUTES;
            fakeProgress()
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
        if(showDots||newMessage) chatBottomRef.current.scrollIntoView({ SCROLL_STYLE });
    }, [showDots, newMessage, currentChat, SCROLL_STYLE]);

    useEffect(() => {
        quotedMessageText && replyRef.current.scrollIntoView({ SCROLL_STYLE });
    }, [SCROLL_STYLE, quotedMessageText]);
    
    if (isLoading) {
        return (
            <><LoadingBar className='loading-bar'
                shadow={false}
                progress={progress}
                onLoaderFinished={() => setProgress(0)} /><div style={{ marginTop: 250 }}>
                    <MsgLoader />
                </div></>)
    }

    const getChatDetails = (c) => {
        dispatch({ type: 'resetChatBox' })
        dispatch({ type: 'setCurrentChat', payload: c })
        history.push('/chat')
    }

    const onSelectConversation = (c) => {
        socket.emit('markMsgsRead', {
            senderId: userId,
            receiverId: c.userId
        })
        getChatDetails(c)
    }

    const onCloseCurrentChat = () => {
        socket.emit('markMsgsRead', {
            senderId: userId,
            receiverId: ''
        })
        dispatch({ type: 'resetChatBox' })
    }

    const handleDeleteMessage = async (message) => {
        try {
            const { deleteMessage } = CHAT_ROUTES;
            await chatPost(deleteMessage, message)
            socket.emit('deleteMessage', {
                receiverId: currentChat.userId,
                messageId: message.messageId
            })
            dispatch({ type: 'deleteMessage', payload: message.messageId })
            dispatch({ type: 'clearQuotedMessage' })
        } catch (error) {
            return toast.error(`Unable to delete: ${error}`)
        }
    }
    const handleReplyMessage = (message, quotedMessageUserHandle) => dispatch({
        type: 'setQuotedMessage',
        payload: { message, quotedMessageUserHandle }
    })

    const displayReplyToast = () => (
        <div className='replyQuoteToast' ref={replyRef}>
            <Toast className='replyQuoteWrapper'
                animation={false}
                show={quotedMessageText}
                onClose={() => dispatch({ type: 'clearQuotedMessage' })}>
                <Toast.Body >
                    <Row className='replyQuoteUserHandle'>
                        <Col > {quotedMessageUserHandle} </Col>
                        <Col sm={4} className='replyQuoteCloseX'><i className="fas fa-times"
                            onClick={() => dispatch({ type: 'clearQuotedMessage' })} /></Col>
                    </Row>
                    <Row className='replyQuoteText'>
                        <Col sm={8} > {quotedMessageText} </Col>
                    </Row>
                </Toast.Body>
            </Toast>
        </div>
    )

    const popover = (
        <Popover id={'popover'}>
            <UserCard
                cardUserId={currentChat.userId}
                loggedInUserId={userId} />
        </Popover>
    )

    const onEmojiClick = (e, emojiObject) => {
        const text = newMessage + ' ' + emojiObject.emoji + ' ';
        setNewMessage(text);
    };

    const handleSubmit = async () => {
        try {
            const { sendMessage } = CHAT_ROUTES;
            const timestamp = Date.now()
            const message = {
                senderId: userId,
                receiverId: currentChat?.userId,
                text: newMessage,
                conversationId: currentChat?.conversationId,
                quotedMessageId: quotedMessageId || '',
                quotedMessageUserId,
                quotedMessageText: quotedMessageText || '',
                timestamp
            }
            const res = await chatPost(sendMessage, message)
            const displayMsgObj = { ...message, userHandle: user.userHandle, replyUserHandle: quotedMessageUserHandle, messageId: res.data.messageId, avatar: user.avatar }
            dispatch({ type: 'newMessage', payload: displayMsgObj })
            setNewMessage('');
            dispatch({ type: 'clearQuotedMessage' })
            socket.emit('sendMessage', { data: displayMsgObj })
        } catch (error) {
            return toast.error(`Unable to send message: ${error}`)
        }
    }

    return (
        <>
            <LoadingBar className='loading-bar'
                shadow={false}
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            <div className='chat-page'>
                <Container className='chatContainer'>
                    <Row>
                        <Col xs={3} className='chatMenu'>
                            <Row className='chatMenuHeader'>
                                <Col className='chatMenuHeaderText'><i className='far fa-comments chatMenuHeaderIcon' />Conversations</Col>
                            </Row>
                            <Row className='chatMenuWrapper'>
                                <DisplayConversationMenu
                                    conversationData={conversationData}
                                    onSelectConversation={onSelectConversation}
                                    loggedInUserId={userId}
                                />
                            </Row>
                        </Col>
                        <Col>
                            <div className='chatBoxWrapper'>
                                {!currentChat
                                    ? <DisplayStartNewChat />
                                    : <>
                                        <Navbar bsPrefix='chatBoxHeader'>
                                            <div className='chatBoxHeaderClose'>
                                                <CloseButton variant='white'
                                                    onClick={() => onCloseCurrentChat()} />
                                            </div>
                                            <OverlayTrigger rootClose placement='bottom' delay={500} overlay={popover}>
                                                <Image
                                                    className='chatBoxHeaderImg'
                                                    src={currentChat?.avatar || process.env.REACT_APP_BLANK_USER_AVATAR}
                                                    onError={({ currentTarget }) => {
                                                        currentTarget.onerror = null; // prevents looping
                                                        currentTarget.src = process.env.REACT_APP_BLANK_USER_AVATAR;
                                                    }}
                                                    alt={currentChat?.userHandle}
                                                    onClick={() => history.push('/profile/?_id=' + currentChat.userId)} />
                                            </OverlayTrigger>
                                            <div onClick={() => history.push('/profile/?_id=' + currentChat.userId)}>
                                                <div className='chatBoxHeaderUserHandle'>
                                                    {currentChat?.userHandle}
                                                </div>
                                                <div className='chatBoxHeaderName'>
                                                    {currentChat?.firstName}{' '}{currentChat?.lastName}
                                                </div>
                                            </div>
                                        </Navbar>
                                        <div className='chatBoxTop' ref={scrollUpRef} >
                                            <InfiniteScroll
                                                inverse={true}
                                                hasMore={hasMoreMsgs}
                                                dataLength={messages?.length || 0}
                                                next={fetchMessages}
                                                scrollableTarget='scrollableDiv'
                                                loader={<p></p>}
                                            >
                                                <div className='keep-scrolling' id='scrollableDiv'>
                                                    {
                                                        messages?.map((m, i) => (
                                                            <div className={m?.senderId === userId ? 'messageRow own' : 'messageRow'}
                                                                key={m?.messageId || i} >
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
                                                    {showDots && <div className='chatBoxTopTypingBubble' ref={typingScrollRef}>
                                                        <DisplayTypingBubble currentChat={currentChat} />
                                                    </div>}
                                                </div>
                                            </InfiniteScroll>
                                            <div className='displayReplyToast'>
                                                {displayReplyToast()}
                                            </div>

                                        </div>
                                        <Navbar fixed='bottom' bsPrefix='chatBoxBottom'>
                                            <InputGroup >
                                                <DisplayEmojiPicker {...{ onEmojiClick }} />
                                                <FormControl onSubmit={handleSubmit}
                                                    ref={emojiRef}
                                                    aria-label='Chat input'
                                                    className='chatMessageInput'
                                                    placeholder='Start typing..'
                                                    onChange={(e) => setNewMessage(e.target.value)}
                                                    onKeyPress={(e) => { if (e.key === 'Enter' && newMessage) handleSubmit(); }}
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
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
})
export default withRouter(Messenger);
