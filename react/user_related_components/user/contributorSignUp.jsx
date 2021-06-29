import React, { useContext } from "react";
import VerifyCodeForm from "./shared/VerifyCodeForm";
import ContributorSignUpForm from "./contributorLogin/ContributorSignUpForm";
import ErrorsModal from './shared/ErrorsModal';
import storeContext from "../../stores/storeContext";
import { observer } from "mobx-react";
import VerifyContributorLink from "./contributorLogin/VerifyContributorLink"

const ContributorSignUp = observer(() => {
    const store = useContext(storeContext);
    const { loginStore } = store;
    const { isVerifyCodeForm } = loginStore;

    return (
        <div id='logreg-login'>
            <div className='row no-gutters'>
                <div className='col-md-4'></div>
                {/*    <div id="logreg-forms" className="col-md-17">*/}
                <VerifyContributorLink />
                {!isVerifyCodeForm && <ContributorSignUpForm />}
                {isVerifyCodeForm && <VerifyCodeForm />}
                <ErrorsModal />
                {/*    </div>*/}
            </div>
        </div>
    );
});

export default ContributorSignUp;