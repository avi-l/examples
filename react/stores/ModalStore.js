import { observable, action } from 'mobx';

class ModalStore {

    @observable
    showShareModal = false;

    @observable
    showCommentInput = false; //#

    @observable
    showTrashPopup = { show: false, id: '', action: '', message: '', data: '' }

    @observable
    showGuestPopup = false;

    @observable
    showUploadPicModal = { show: false, folder: '', action: '' }

    @observable
    showEditProfileModal = false;

    @observable
    showFollowersModal = {
        show: false,
        user: '',
        loggedInUserId: '',
        showType: '',
    };
    @observable
    showStartChatModal = false;

    @observable
    showUserCardModal = {
        show: false,
        cardUserId: '',
        loggedInUserId: ''
    };

    @observable
    showErrorPopup = {
        show: false,
        message: '',
        tryAgain: false,
    };
    @observable
    showConfirmCancelPopup = {
        show: false,
        message: '',
        action: '',
    };

    @observable
    showVerifyModal = { result: '', tries: 0, phone: '', firstName: '', lastName: '' };

    @observable
    showInviteAssistantModal = false;


    @action
    setShowShareModal = bool => {
        this.showShareModal = bool;
    };

    @action
    setShowCommentInput = bool => {
        this.showCommentInput = bool; //#
    };

    @action
    setShowTrashPopup = pop => {
        this.showTrashPopup = pop;
    }

    @action
    setShowGuestPopup = (bool) => {
        this.showGuestPopup = bool;
    }

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
    setShowStartChatModal = bool => {
        this.showStartChatModal = bool;
    }
    @action
    setShowUserCardModal = obj => {
        this.showUserCardModal = obj;
    }

    @action
    setShowConfirmCancelPopup = pop => {
        this.showConfirmCancelPopup = pop;
    }

    @action
    setShowVerifyModal = bool => {
        this.showVerifyModal = bool;
    };

    @action
    setShowInviteAssistantModal = bool => {
        this.showInviteAssistantModal = bool;
    };

}

const modalStore = new ModalStore();
export default modalStore;