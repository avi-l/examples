import React, { useContext, useEffect, useState, useRef, useReducer } from 'react';
import Button from 'react-bootstrap/Button';
import Message from './message/Message';
import storeContext from '../../stores/storeContext'
import './messenger.css'
import socket from '../shared/socket'
import { observer } from 'mobx-react';
import { deleteMessage, getConversations, getMessages, newConversation, postMessages } from './chat_api';
import { getUser } from '../user/user_api'
import { isUserLoggedIn, setUserProfileData } from '../user/userManagement';
import { CloseButton, Col, Container, FormControl, Image, InputGroup, Row } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useHistory, withRouter } from 'react-router-dom';
import queryString from 'query-string';
import StartChatModal from './StartChatModal';
import { forceReload } from '../../utilities/forceReload';
import InfiniteScroll from 'react-infinite-scroll-component';
import DisplayTypingBubble from './DisplayTypingBubble';
import DisplayStartNewChat from './DisplayStartNewChat';
import DisplayEmojiPicker from './DisplayEmojiPicker';
import DisplayConversationMenu from './DisplayConversationMenu';
import { MessengerLoader, MsgLoader } from './Loaders';
import UserCardModal from './UserCardModal';
import { reducer } from './reducers/useReducer';

const Messenger = observer(props => {
    const urlSearchParams = queryString.parse(props.location.search);
    const receiverId = urlSearchParams._id;
    const initialState = {
        isLoading: true,
        lastPosition: 0,
        hasMoreMsgs: true,
        conversationList: [],
        currentChat: null,
        currentChatter: null,
        messages: [],
        newMessage: '',
        typing: { show: false, senderId: '' },
    }
    const [state, dispatch] = useReducer(reducer, initialState);
    const [newMessage, setNewMessage] = useState('');
    const store = useContext(storeContext);
    const { userStore, modalStore } = store;
    const { user, setUser } = userStore;
    const { setShowStartChatModal, setShowUserCardModal } = modalStore;
    const history = useHistory();
    const newMsgRef = useRef();
    const scrollUpRef = useRef();
    const typingScrollRef = useRef();
    const emojiRef = useRef();
    const perPage = 10;
    const SCROLL_STYLE = {
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
    };
    const blankAvatar = '/images/blank-profile-picture-973460_960_720.png';

    useEffect(() => {
        isUserLoggedIn(false)
            .then(() => {
                setUserProfileData(user, setUser, false)
                    .then(() => { return null })
                    .catch(err => toast.error(`${err}`))
                if (user.userId) {
                    dispatch({ type: 'loading', payload: false })
                    getConversations({ userId: user.userId })
                        .then(res => dispatch({ type: 'conversationList', payload: res.data }))
                        .catch(err => toast.error(`${err}`))
                }
            })
            .catch(() => {
                toast.error(`Please sign in to use this feature`,
                    {
                        toastId: 'preventDuplicate',
                        position: 'top-center',
                        onClose: () => forceReload('/signIn')
                    })
            });
    }, [user.userId])

    useEffect(() => {
        socket.on('getMessage', (data) => {
            dispatch({ type: 'newMessage', payload: data })
            dispatch({ type: 'typing', payload: { show: false } })
        })
        socket.on('deleteMessage', (data) => {
            dispatch({ type: 'deleteMessage', payload: data.messageId })
        })
        socket.on('userStartedTyping', (data) => {
            dispatch({ type: 'typing', payload: { show: true, senderId: data.senderId } })
        })
        socket.on('userStoppedTyping', (data) => {
            dispatch({ type: 'typing', payload: { show: false, senderId: data.senderId } })
        })
    }, []);

    useEffect(() => {
        fetchMessages()
    }, [state.currentChat]);

    useEffect(() => {
        if (receiverId && user.userId) {
            dispatch({ type: 'resetMessages', payload: [] })
            newConversation({ senderId: user.userId, receiverId })
                .then(res => {
                    if (res.data.newChat) {
                        dispatch({ type: 'newConversation', payload: res.data.conversation })
                    }
                    getChatterDetails(res.data.conversation)
                })
                .catch(err => toast.error(`${err}`))
        }
    }, [receiverId, user.userId]);

    useEffect(() => {
        const receiverId = state.currentChat?.members?.find(member => member !== user.userId)
        const startStop = newMessage ? 'userStartedTyping' : 'userStoppedTyping'
        socket.emit(startStop, {
            senderId: user.userId,
            receiverId
        })
    }, [newMessage])

    useEffect(() => {
        if (state.currentChat) {
            newMsgRef.current && newMsgRef.current.scrollIntoView({ SCROLL_STYLE });
            state.lastPosition && scrollUpRef.current.scrollIntoView({ SCROLL_STYLE });
            state.typing.show && typingScrollRef.current.scrollIntoView({ SCROLL_STYLE });
            state.newMessage && emojiRef.current.scrollIntoView({ SCROLL_STYLE });
        }
    }, [state.messages, state.typing?.show, newMessage, state.lastPosition]);

    const onSelectConversation = (c) => {
        setShowUserCardModal({ show: false, cardUserId: '', loggedInUserId: '' })
        setShowStartChatModal(false)
        socket.emit('markMsgsRead', {
            senderId: user.userId,
            receiverId
        })
        if (c.members?.find(u => u === state.currentChatter?.userId)) {
            setUser({ ...user, unreadMsgsUserIds: user.unreadMsgsUserIds.filter(u => u !== state.currentChatter?.userId) })
            return;
        }
        else getChatterDetails(c)
    }

    const onCloseCurrentChat = () => {
        dispatch({ type: 'resetChatBox' })
        setShowUserCardModal({ show: false, cardUserId: '', loggedInUserId: '' })
    }

    const getChatterDetails = async (c) => {
        history.push('/chat')
        dispatch({ type: 'resetChatBox' })
        dispatch({ type: 'setCurrentChat', payload: c })
        const chatterId = c?.members?.find(m => m !== user.userId)
        getUser({ userId: chatterId })
            .then((res) => {
                dispatch({ type: 'setCurrentChatter', payload: res.data })
                setUser({ ...user, unreadMsgsUserIds: user.unreadMsgsUserIds.filter(u => u !== chatterId) })
            })
            .catch((err) => toast.error(`${err}`))
    }

    const fetchMessages = () => {
        console.count('Fetching')
        if (state.currentChat) {
            const senderId = state.currentChat.members?.find(m => m !== user.userId)
            getMessages({
                conversationId: state.currentChat?._id,
                receiverId: user?.userId,
                senderId,
                skip: state.lastPosition,
                limit: perPage,
            })
                .then(res => {
                    if (!res.data) dispatch({ type: 'hasMoreMsgs', payload: false })
                    else {
                        const type = !state.messages?.length ? 'messages' : 'addMsgsToTop';
                        dispatch({ type, payload: res.data.messages.sort((a, b) => a.timestamp - b.timestamp) })
                        dispatch({ type: 'hasMoreMsgs', payload: res.data.totalMsgs > state.lastPosition })
                    }
                })
                .catch(err => toast.error(`${err}`))
            dispatch({ type: 'setLastPosition', payload: perPage })
        }
        else dispatch({ type: 'hasMoreMsgs', payload: false })
    }

    const handleDeleteMessage = (message) => {
        deleteMessage(message)
            .then(() => {
                socket.emit('deleteMessage', {
                    receiverId: state.currentChatter.userId,
                    messageId: message._id
                })
                dispatch({ type: 'deleteMessage', payload: message._id })
            })
            .catch(err => toast.error(err))
    }

    const handleSubmit = () => {
        const receiverId = state.currentChat.members.find(member => member !== user.userId)
        const message = {
            senderId: user?.userId,
            receiverId,
            text: newMessage,
            conversationId: state.currentChat?._id,
            timestamp: Date.now(),
        }
        postMessages(message)
            .then((res) => {
                dispatch({ type: 'newMessage', payload: res.data })
                setNewMessage('');
                socket.emit('sendMessage', {
                    senderId: user.userId,
                    receiverId,
                    text: newMessage,
                    timestamp: Date.now()
                })
            })
            .catch(err => toast.error(`${err}`))
    }

    if (state.isLoading) return <div style={{ marginTop: 150 }}><MessengerLoader /></div>

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
                                conversations={state.conversationList}
                                onSelectConversation={onSelectConversation}
                                loggedInUserId={user?.userId}
                            />
                        </div>
                    </Col>
                    <Col>
                        <div className='chatBox'>
                            <div className='chatBoxWrapper'>
                                {!state.currentChat
                                    ? <DisplayStartNewChat />
                                    : <>
                                        <div className='chatBoxHeader'>
                                            <div className='chatBoxHeaderClose'>
                                                <CloseButton variant='white'
                                                    onClick={() => onCloseCurrentChat()} />
                                            </div>
                                            <Image
                                                className='chatBoxHeaderImg'
                                                src={state.currentChatter?.avatar || blankAvatar}
                                                alt={state.currentChatter?.userHandle}
                                                onClick={() => setShowUserCardModal({ show: true, cardUserId: state.currentChatter?.userId, loggedInUserId: user.userId })} />

                                            <div className='chatBoxHeaderName'
                                                onClick={() => setShowUserCardModal({ show: true, cardUserId: state.currentChatter?.userId, loggedInUserId: user.userId })}>
                                                {state.currentChatter?.userHandle}
                                            </div>
                                        </div>
                                        <div ref={scrollUpRef} className='keep-scrolling chatBoxTop' id='scrollableDiv'>
                                            <InfiniteScroll
                                                className='infiniteScroll'
                                                inverse={true}
                                                hasMore={state.hasMoreMsgs}
                                                dataLength={state.messages?.length}
                                                next={fetchMessages}
                                                scrollableTarget='scrollableDiv'
                                                // loader={<h6>Fetching...</h6>}
                                            >
                                                <div className='keep-scrolling' >
                                                    {!state.messages?.length && !state.currentChatter ? <MsgLoader />
                                                        : state.messages?.map((m) => (
                                                            <div className={m?.senderId === user?.userId ? 'messageRow own' : 'messageRow'}
                                                                key={m.timestamp} ref={newMsgRef} >
                                                                <Message
                                                                    message={m}
                                                                    own={m?.senderId === user?.userId}
                                                                    currentChatter={state.currentChatter}
                                                                    loggedInUser={user}
                                                                    handleDeleteMessage={handleDeleteMessage} />
                                                            </div>
                                                      
                                                        ))
                                                    }
                                                </div>
                                            </InfiniteScroll>
                                            {state.typing.show && <div className='chatBoxTopTypingBubble' ref={typingScrollRef}>
                                                <DisplayTypingBubble currentChatter={state.currentChatter} />
                                            </div>}
                                        </div>
                                        <div className='chatBoxBottom'>
                                            <div className='chatBoxInputBar'>
                                                <InputGroup className='mb-4'>
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
                                                        onClick={() => newMsgRef.current.scrollIntoView({ SCROLL_STYLE })}>
                                                        <i className='fa fa-angle-double-down chatMessageScrollBtnIcon' />
                                                    </Button>
                                                </InputGroup>
                                            </div>
                                        </div>
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