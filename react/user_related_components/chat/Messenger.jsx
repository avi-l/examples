import React, { useContext, useEffect, useState, useRef } from 'react';
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
import {useHistory, withRouter} from 'react-router-dom';
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

const Messenger = observer(props => {
    const urlSearchParams = queryString.parse(props.location.search);
    const receiverId = urlSearchParams._id;
    const [isLoading, setIsLoading] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [currentChatter, setCurrentChatter] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const perPage = 10;
    const [lastPosition, setLastPosition] = useState(0);
    const [totalMsgs, setTotalMsgs] = useState();
    const [hasMore, setHasMore] = useState(false);
    const [typing, setTyping] = useState(null);
    const [showTypingDots, setShowTypingDots] = useState(false);
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const store = useContext(storeContext);
    const { userStore, modalStore } = store;
    const { user, setUser } = userStore;
    const { setShowStartChatModal, setShowUserCardModal } = modalStore;
    const history = useHistory();
    const newMsgRef = useRef();
    const typingScrollRef = useRef();
    const emojiRef = useRef();
    const SCROLL_STYLE = {
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
    };
    const blankAvatar = '/images/blank-profile-picture-973460_960_720.png';

    setTimeout(() => {
        isUserLoggedIn(false)
            .then(() => setIsLoading(false))
            .catch(() => {
                toast.error(`Please sign in to use this feature`,
                    {
                        toastId: 'preventDuplicate',
                        position: 'top-center',
                        onClose: () => forceReload('/signIn')
                    })
            });
    }, 1000)

    useEffect(() => {
        socket.on('getMessage', (data) => {
            setArrivalMessage({
                senderId: data.senderId,
                text: data.text,
                timestamp: data.timestamp
            })
        })
        socket.on('deleteMessage', (data) => {
            setMessages((prev) => (prev.filter((m) => m._id !== data.messageId)))
        })
        socket.on('userStartedTyping', (data) => {
            setTyping({ show: true, data })
        })
        socket.on('userStoppedTyping', (data) => {
            setTyping({ show: false, data })
        })
        // socket.on('getUsers', (users) => {
        //     setOnlineUsers(
        //         user.following.filter((f) => users.some((u) => u.userId === f))
        //       );     
        // });
    }, []);

    useEffect(() => {
        setUserProfileData(user, setUser, false)
            .then(() => { return null })
            .catch(err => toast.error(`${err}`))
        if (user.userId) {
            setIsLoading(false)
            getConversations({ userId: user.userId })
                .then(res => setConversations(res.data))
                .catch(err => toast.error(`${err}`))
        }
    }, [user.userId]);

    useEffect(() => {
        arrivalMessage &&
            currentChat?.members.includes(arrivalMessage?.senderId) &&
            setMessages((prev) => [...prev, arrivalMessage])
        setShowTypingDots(false)
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        currentChat?.members.includes(typing?.data?.senderId) &&
            setShowTypingDots(typing?.show)
    }, [typing, currentChat]);

    useEffect(() => {
        fetchMessages()
    }, [currentChat]);

    useEffect(() => {
        if (receiverId && user.userId) {
            setMessages([])
            newConversation({ senderId: user.userId, receiverId })
                .then(res => {
                    if (res.data.newChat) {
                        setConversations((prev) => [res.data.conversation, ...prev])
                    }
                    const conversation = res.data.conversation
                    getChatterDetails(conversation)
                })
                .catch(err => toast.error(`${err}`))
        }
    }, [receiverId, user.userId]);

    useEffect(() => {
        const receiverId = currentChat?.members?.find(member => member !== user.userId)
        const startStop = newMessage ? 'userStartedTyping' : 'userStoppedTyping'
        socket.emit(startStop, {
            senderId: user.userId,
            receiverId
        })
    }, [newMessage])

    useEffect(() => {
        if (currentChat) {
            newMsgRef.current && newMsgRef.current.scrollIntoView({ SCROLL_STYLE });
            showTypingDots && typingScrollRef.current.scrollIntoView({ SCROLL_STYLE });
            newMessage && emojiRef.current.scrollIntoView({ SCROLL_STYLE });
        }
    }, [messages, showTypingDots, newMessage]);

    const onSelectConversation = (c) => {
        setShowUserCardModal({ show: false, cardUserId: '', loggedInUserId: '' })
        setShowStartChatModal(false)
        socket.emit('selectedConversation', {
            senderId: user.userId,
            receiverId
        })
        if (c.members?.find(u => u === currentChatter?.userId)) {
            setUser({ ...user, unreadMsgsUserIds: user.unreadMsgsUserIds.filter(u => u !== currentChatter?.userId) })
            return;
        }
        else {
            setCurrentChatter()
            setShowTypingDots(false)
            getChatterDetails(c)
            setMessages([])
            setLastPosition(0)
        }
    }
    const onCloseCurrentChat = () => {
        setCurrentChat(null)
        setNewMessage('')
        setMessages([])
        setCurrentChatter()
        setShowUserCardModal({ show: false, cardUserId: '', loggedInUserId: '' })
        setLastPosition(0)
    }

    const getChatterDetails = async (c) => {
        history.push('/chat')
        setCurrentChat(c)
        const chatterId = c?.members?.find(m => m !== user.userId)
        getUser({ userId: chatterId })
            .then((res) => {
                setCurrentChatter(res.data)
                setUser({ ...user, unreadMsgsUserIds: user.unreadMsgsUserIds.filter(u => u !== chatterId) })
            })
            .catch((err) => toast.error(`${err}`))
    }

    const fetchMessages = () => {
        if (currentChat) {
            const senderId = currentChat.members?.find(m => m !== user.userId)
            console.count('Fetching')
            getMessages({
                conversationId: currentChat?._id,
                receiverId: user?.userId,
                senderId,
                skip: lastPosition,
                limit: perPage,
            })
                .then(res => {
                    if (!res.data) setHasMore(false)
                    else {

                        !totalMsgs && setTotalMsgs(res.data.totalMsgs)
                        !messages.length ? setMessages(res.data.messages.sort((a, b) => a.timestamp - b.timestamp))
                            : setMessages([...res.data.messages.sort((a, b) => a.timestamp - b.timestamp), ...messages])

                    }
                })
                .catch(err => toast.error(`${err}`))
            setLastPosition(lastPosition + perPage)
            setHasMore(lastPosition < totalMsgs)
        }
        else setHasMore(false)
    }

    const handleDeleteMessage = (message) => {
        deleteMessage(message)
            .then(() => {
                socket.emit('deleteMessage', {
                    receiverId: currentChatter.userId,
                    messageId: message._id
                })
                setMessages((prev) => (prev.filter((m) => m._id !== message._id)))
            })
            .catch(err => toast.error(err))
    }

    const handleSubmit = () => {
        const receiverId = currentChat.members.find(member => member !== user.userId)
        const message = {
            senderId: user?.userId,
            receiverId,
            text: newMessage,
            conversationId: currentChat?._id,
            timestamp: Date.now(),
            receiverHasRead: false
        }
        postMessages(message)
            .then((res) => {
                setMessages([...messages, res.data])
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

    if (isLoading) {
        return (
            <div style={{ marginTop: 150 }}><MessengerLoader /></div>
        )
    }
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
                                conversations={conversations}
                                onSelectConversation={onSelectConversation}
                                loggedInUserId={user?.userId}
                            />
                        </div>
                    </Col>
                    <Col>
                        <div className='chatBox'>
                            <div className='chatBoxWrapper'>
                                {!currentChat
                                    ? <DisplayStartNewChat />
                                    : <>
                                        <div className='chatBoxHeader'>
                                            <div className='chatBoxHeaderClose'>
                                                <CloseButton variant='white'
                                                    onClick={() => onCloseCurrentChat()} />
                                            </div>
                                            <Image
                                                className='chatBoxHeaderImg'
                                                src={currentChatter?.avatar || blankAvatar}
                                                alt={currentChatter?.userHandle}
                                                onClick={() => setShowUserCardModal({ show: true, cardUserId: currentChatter?.userId, loggedInUserId: user.userId })} />

                                            <div className='chatBoxHeaderName'
                                                onClick={() => setShowUserCardModal({ show: true, cardUserId: currentChatter?.userId, loggedInUserId: user.userId })}>
                                                {currentChatter?.userHandle}
                                            </div>
                                        </div>

                                        <div className='keep-scrolling chatBoxTop' >
                                            <div ref={newMsgRef} id='scrollableDiv'>
                                                <InfiniteScroll
                                                    className='keep-scrolling'
                                                    dataLength={messages?.length}
                                                    next={fetchMessages}
                                                    hasMore={hasMore}
                                                    scrollableTarget='scrollableDiv'
                                                // loader={hasMore ? <Loading /> : <p></p>}
                                                >
                                                    <div className='keep-scrolling'>
                                                        {!messages.length && !currentChatter ? <MsgLoader />
                                                            : messages?.map((m) => (
                                                                <div className={m?.senderId === user?.userId ? 'messageRow own' : 'messageRow'}
                                                                    key={m.timestamp} ref={newMsgRef}>
                                                                    <Message
                                                                        message={m}
                                                                        own={m?.senderId === user?.userId}
                                                                        currentChatter={currentChatter}
                                                                        loggedInUser={user}
                                                                        handleDeleteMessage={handleDeleteMessage} />
                                                                </div>
                                                
                                                            ))
                                                        }
                                                    </div>
                                                </InfiniteScroll>
                                                {showTypingDots && <div className='chatBoxTopTypingBubble' ref={typingScrollRef}>
                                                    <DisplayTypingBubble currentChatter={currentChatter} />
                                                </div>}
                                            </div>
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