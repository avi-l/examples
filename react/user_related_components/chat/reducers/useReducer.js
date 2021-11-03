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
        case 'conversationList': {
            return { ...state, conversationList: action.payload };
        }
        case 'newConversation': {
            return {
                ...state,
                conversationList: [action.payload, ...state.conversationList]
            };
        }
        case 'setCurrentChat': {
            return { ...state, currentChat: action.payload };
        }
        case 'setCurrentChatter': {
            return { ...state, currentChatter: action.payload };
        }
        case 'messages': {
            return { ...state, messages: action.payload };
        }
        case 'resetMessages': {
            return action.payload;
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
        case 'addMsgsToTop': {
            return { ...state, messages: [...action.payload, ...state.messages] };
        }
        case 'typing': {
            if (state.currentChatter?.userId === action.payload.senderId) {
                return { ...state, typing: action.payload };
            }
            return state;
        }
        case 'resetChatBox': {
            return {
                ...state,
                lastPosition: 0,
                hasMoreMsgs: true,
                currentChat: null,
                currentChatter: null,
                messages: [],
                newMessage: '',
                typing: { show: false, senderId: '' },
                arrivalMessage: null,
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