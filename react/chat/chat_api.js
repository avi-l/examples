import axios from 'axios';
import { currentRoute } from '../../currentRoute';

export const chatPost = (route, data) => axios.post(currentRoute + route, data)
export const chatGet = (route, data) => axios.get(currentRoute + route, { params: data });
