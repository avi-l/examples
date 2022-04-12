import { observable, action } from 'mobx';

class UserStore {

    @observable
    user = {
        userHandle: 'Guest',
        userId: '',
        isContributor: false,
        isAssistant: false,
        authProvider: String,
        firstName: String,
        lastName: String,
        avatar: process.env.REACT_APP_BLANK_USER_AVATAR,
        isActive: Boolean,
        userResources: {
            email: String,
            mobilePhone: String,
            address1: String,
            address2: String,
            city: String,
            state: String,
            zip: String,
            country: String,
            totalFollowers: Number,
            totalFollowing: Number,
        }   
    };

    @observable
    userObject = {};

    @action
    setUser = obj => {
        this.user = obj;
    };

    @action
    setUserObject = obj => {
        this.userObject = obj;
    };

}

const userStore = new UserStore();
export default userStore;