import axios from 'axios';
import { currentRoute } from '../../currentRoute';


export const getConversations = async (data) => {
    let res = await axios.get(currentRoute + '/conversation/getConversation', {params: data});
    try {
        return res;
    }
    catch (error) {
        return error
    }
}
export const newConversation = async (data) => {
    let res = await axios.post(currentRoute + '/conversation/newConversation', data);
    try {
        return res;
    }
    catch (error) {
        return error
    }
}
export const getMessages = async (data) => {
    let res = await axios.get(currentRoute + '/message/getMessage', {params: data});
    try {
        return res;
    }
    catch (error) {
        return error
    }
}
export const postMessages = async (data) => {
    let res = await axios.post(currentRoute + '/message/sendMessage', data);
    try {
        return res;
    }
    catch (error) {
        return error
    }
}
export const deleteMessage = async (data) => {
    let res = await axios.post(currentRoute + '/message/deleteMessage', data);
    try {
        return res;
    }
    catch (error) {
        return error
    }
}