export const reducer = (state, action) => {
    switch (action.type) {
        case 'loading': {
            return { ...state, isLoading: action.payload };
        }
        case 'hasMoreMsgs': {
            return { ...state, hasMoreMsgs: action.payload };
        }
        case 'setLastPosition': {
            return { ...state, lastPosition: state.lastPosition + action.payload };
        }
        case 'conversationData': {
            return { ...state, conversationData: action.payload };
        }
        case 'newConversation': {
            const currentConv = state.conversationData
            const newConv = action.payload
            const found = currentConv.some(C => C.userId === newConv.userId)
            if (!found) {
                return {
                    ...state, conversationData: [newConv, ...currentConv]
                }
            }
            return { ...state }
        }
        case 'setCurrentChat': {
            return { ...state, currentChat: action.payload };
        }
        case 'messages': {
            return { ...state, messages: action.payload };
        }
        case 'deleteMessage': {
            return {
                ...state,
                messages: [...state.messages.filter((m) => m._id !== action.payload)]
            };
        }
        case 'newMessage': {
            return { ...state, messages: [...state.messages, action.payload] };
        }
        case 'setQuotedMessage': {
            return { ...state, 
                quotedMessageId: action.payload.message._id, 
                quotedMessageUserHandle: action.payload.quotedMessageUserHandle,
                quotedMessageText: action.payload.message.text };
        }
        case 'clearQuotedMessage': {
            return { ...state, 
                quotedMessageId: '', 
                quotedMessageUserHandle: '',
                quotedMessageText: '' };
        }
        case 'addMsgsToTop': {
            return { ...state, messages: [...action.payload, ...state.messages] };
        }
        case 'typing': {
            if (state.currentChat?.userId === action.payload.senderId) {
                return { ...state, typing: action.payload };
            }
            return state;
        }
        case 'resetChatBox': {
            return {
                ...state,
                lastPosition: 0,
                hasMoreMsgs: true,
                currentChat: '',
                messages: [],
                quotedMessageId: '',
                quotedMessageText: '',
                typing: { showDots: false, senderId: '' },
            }
        }
        case 'reset': {
            return action.payload;
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}