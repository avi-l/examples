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

export const checkEmailExists = async data => {
    let res = await axios.post(currentRoute + '/users/checkEmailExists', data);
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

export const checkUser = async data => {
    let res = await axios.post(currentRoute + '/users/checkUser', data);
    try {
        return res;
    } catch (error) {
        return error;
    }
};
