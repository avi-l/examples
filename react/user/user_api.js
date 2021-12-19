import axios from 'axios';
import { currentRoute } from '../../currentRoute';

/// get
export const searchUsers = data => axios.get(currentRoute + '/users/searchUsers', {params: data});
export const getFollowDetails = data => axios.get(currentRoute + '/users/getFollowDetails', {params: data});
export const checkEmailExists = data => axios.get(currentRoute + '/users/checkEmailExists', {params: data});
export const checkUserExists = data => axios.get(currentRoute + '/users/checkUserExists', {params: data});
export const checkUserHandleExists = data => axios.get(currentRoute + '/users/checkUserHandleExists', {params: data});
export const getUser = data => axios.get(currentRoute + '/users/getUser', {params: data})
export const getUserComments = data => axios.get(currentRoute + '/comments/getUserComments', {params: data});
/// post
export const getUserReps = data => axios.post(currentRoute + '/reputation/getUserReps', data);
export const getUserFeedbacks = data => axios.post(currentRoute + '/feedbacks/getUserFeedbacks', data);
export const followUnfollowUser = (route, data) => axios.post(currentRoute + route, data);
export const deactivateUser = data => axios.post(currentRoute + '/users/deactivateUser', data);
export const signCloudindaryURL = (data, config) => axios.post(currentRoute + '/users/signCloudindaryURL', data, {});
export const addUser = data => axios.post(currentRoute + '/users/addUser', data);
export const deactivateCode = data => axios.post(currentRoute + '/contributor/deactivateCode', data)
export const updateUserDetails = data => axios.post(currentRoute + '/users/updateUserDetails', data);
export const userInfo = data => axios.post(currentRoute + '/users/userInfo', data); // Chaim uses, maybe deprecate?
export const checkContributorInvite = data => axios.post(currentRoute + '/contributor/checkContributorInvite', data)















   




