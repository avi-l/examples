import {observable, action} from 'mobx';

class ModalStore {

   

    @observable
    showUploadPicModal = false;

    @observable
    showEditProfileModal = false;

    @observable
    showFollowersModal = {
        show: false,
        user: '',
        showType: '',
    };

    @observable
    showErrorPopup = {
        show: false, 
        message: '', 
        tryAgain: false, 
        signOut: false, 
        isLoggedIn: false, 
        makeContributor: false,
        goHomeAsContributor: false
    };
    @observable
    showConfirmCancelPopup = {
        show: false, 
        message: '', 
        action: '',
    };

    @action
    setShowErrorPopup = pop => {
        this.showErrorPopup = pop;
    }
    @action
    setShowUploadPicModal = pop => {
        this.showUploadPicModal = pop;
    }
    @action
    setShowEditProfileModal = pop => {
        this.showEditProfileModal = pop;
    }
    @action
    setShowFollowersModal = obj => {
        this.showFollowersModal = obj;
    }

    @action
    setShowConfirmCancelPopup = pop => {
        this.showConfirmCancelPopup = pop;
    }

    @action
    setShowVerifyModal = bool => {
        this.showVerifyModal = bool;
    };

}

const modalStore = new ModalStore();
export default modalStore;