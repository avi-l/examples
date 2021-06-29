import {observable, action} from 'mobx';

class ModalStore {

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
        action: ''
    };

    

    @action
    setShowErrorPopup = pop => {
        this.showErrorPopup = pop;
    }

    @action
    setShowConfirmCancelPopup = pop => {
        this.showConfirmCancelPopup = pop;
    }

}

const modalStore = new ModalStore();
export default modalStore;