import {observable, action} from 'mobx';

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
            email: String,
            location: String,
            mobilePhone: String,
            avatar: String,
            active: Boolean,
            followers:[],
            following:[],
            address: {
                address1: String,
                address2: String,
                city: String,
                state: String,
                zip: String,
                country: String,
            },
            unreadMsgsUserIds: []
        };
        @observable
        profileUser = {
            userHandle: 'Guest',
            userId: '',
            isContributor: false,
            authProvider: String,
            firstName: String,
            lastName: String,
            email: String,
            location: String,
            mobilePhone: String,
            avatar: String,
            active: Boolean,
            followers:[],
            following:[],
            address: {
                address1: String,
                address2: String,
                city: String,
                state: String,
                zip: String,
                country: String,
            },
            unreadMsgsUserIds: []
        };
        @observable
        cardUser = {
            userHandle: 'Guest',
            userId: '',
            isContributor: false,
            firstName: String,
            lastName: String,
            email: String,
            avatar: String,
            active: Boolean,
            followers:[],
            following:[]
        };
    
        @observable
        userObject = {};
    
        @action
        setUser = obj => {
            this.user = obj;
        };
        @action
        setProfileUser = obj => {
            this.profileUser = obj;
        };
        @action
        setCardUser = obj => {
            this.cardUser = obj;
        };
    
        @action
        setUserObject = obj => {
            this.userObject = obj;
        };

}

const userStore = new UserStore();
export default userStore;