import axios from 'axios';
import { currentRoute } from '../../currentRoute';

export const addUser = async data => {
    let res = await axios.post(currentRoute + '/users/addUser', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const checkUserExists = async data => {
    let res = await axios.post(currentRoute + '/users/checkUserExists', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const checkEmailExists = async data => {
    let res = await axios.post(currentRoute + '/users/checkEmailExists', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const checkUserHandleExists = async data => {
    let res = await axios.post(currentRoute + '/users/checkUserHandleExists', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const checkInvite = async data => {
    let res = await axios.post(currentRoute + '/contributor/checkInvite', data)
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const deactivateCode = async data => {
    let res = await axios.post(currentRoute + '/contributor/deactivateCode', data)
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const updateUserDetails = async data => {
    let res = await axios.post(currentRoute + '/users/updateUserDetails', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const userInfo = async data => {
    let res = await axios.post(currentRoute + '/users/userInfo', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const deactivateUser = async data => {
    let res = await axios.post(currentRoute + '/users/deactivateUser', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const getUser = async data => {
    let res = await axios.post(currentRoute + '/users/getUser', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};

export const getFollowDetails = async data => {
    let res = await axios.post(currentRoute + '/users/getFollowDetails', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const searchUsers = async data => {
    let res = await axios.post(currentRoute + '/users/searchUsers', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const getUserComments = async data => {
    let res = await axios.post(currentRoute + '/comments/getUserComments', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const getUserReps = async data => {
    let res = await axios.post(currentRoute + '/reputation/getUserReps', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const getUserFeedbacks = async data => {
    let res = await axios.post(currentRoute + '/feedbacks/getUserFeedbacks', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const signCloudindaryURL = async (data, config) => {
    let res = await axios.post(currentRoute + '/users/signCloudindaryURL', data, {});
    try {
        return res;
    } catch (error) {
        return error;
    }
};
export const followUnfollowUser = async (route, data) => {
    let res = await axios.post(currentRoute + route, data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
