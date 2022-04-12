import { observable, action } from 'mobx';

class ModalStore {

    @observable
    showShareModal = false;

    @observable
    showSaveAssistantModal = {
        show: false,
        managersArray: [],
        additionalReputationsArray:[],
    };

    @observable
    showCommentInput = false; //#

    @observable
    showTrashPopup = { show: false, id: '', action: '', message: '', data: {} }

    @observable
    showGuestPopup = false;

    @observable
    showUploadPicModal = { show: false, folder: '', action: '' }

    @observable
    showVerifyModal = { result: '', tries: 0, phone: '', firstName: '', lastName: '' };

    @observable
    showInviteAssistantModal = false;


    @action
    setShowShareModal = bool => {
        this.showShareModal = bool;
    };

    @action
    setShowSaveAssistantModal = obj => {
        this.showSaveAssistantModal = obj;
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
    setShowUploadPicModal = pop => {
        this.showUploadPicModal = pop;
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