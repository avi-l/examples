import {observable, action} from 'mobx';

class UserStore {

        @observable
        user = {
            userHandle: 'Guest',
            userId: '',
            isContributor: false,
            authProvider: ''
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