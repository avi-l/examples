import {observable, action} from 'mobx';

class UserStore {

        @observable
        user = {
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
            followers:[
                {
                    userId: String,
                    avatar: String,
                    userHandle: String,
                    firstName: String,
                    lastName: String,
                }
            ],
            following:[
                {
                    userId: String,
                    avatar: String,
                    userHandle: String,
                    firstName: String,
                    lastName: String,
                }
            ],
            address: {
                address1: String,
                address2: String,
                city: String,
                state: String,
                zip: String,
                country: String,
            },
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
            followers:[
                {
                    userId: String,
                    avatar: String,
                    userHandle: String,
                    firstName: String,
                    lastName: String,
                }
            ],
            following:[
                {
                    userId: String,
                    avatar: String,
                    userHandle: String,
                    firstName: String,
                    lastName: String,
                }
            ],
            address: {
                address1: String,
                address2: String,
                city: String,
                state: String,
                zip: String,
                country: String,
            },
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
            followers:[
                {
                    userId: String,
                    avatar: String,
                    userHandle: String,
                    firstName: String,
                    lastName: String,
                }
            ],
            following:[
                {
                    userId: String,
                    avatar: String,
                    userHandle: String,
                    firstName: String,
                    lastName: String,
                }
            ]
        };
    
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
}

const userStore = new UserStore();
export default userStore;