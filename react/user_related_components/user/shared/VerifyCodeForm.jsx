import {forceReload} from "../../../utilities/forceReload";
import React, {useState, useContext} from "react";
import {confirmSignUp, signIn} from "../userManagement";
import storeContext from "../../../stores/storeContext";
import {observer} from "mobx-react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const VerifyCodeForm = observer(() => {
    const store = useContext(storeContext);
    const {modalStore, loginStore} = store;
    const {setShowErrorPopup} = modalStore;
    const {
        username,
        email,
        password,
        signUpVerifyCode, setSignUpVerifyCode
    } = loginStore;
    const [isLoading, setIsLoading] = useState(false);

    const submitConfirmUserSignup = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        await confirmSignUp(username, signUpVerifyCode)
          .then(async (res) => {
            await signIn(username, password)
              .then((res) => {
                return forceReload("/userCheck");
              })
              .catch((err) => {
                setShowErrorPopup({show: true, message:`${err.message}. Wrong Validation Code?`, tryAgain: true});
                setIsLoading(false);
                return;
              });
          })
          .catch((err) => {
            setShowErrorPopup({show: true, message:`${err.message}. Wrong Validation Code?`, tryAgain: true});
            setIsLoading(false);
            return;
          });
      };

    return (
        <Form className="form-signin" onSubmit={submitConfirmUserSignup}>
        <h3
          className="h3 mb-3 font-weight-normal"
          style={{ textAlign: "center" }}
        >
          <i className="far fa-lightbulb" /> FILL_IN_THE_BLANK
        </h3>
        <p>
          A verification code has been sent to <b>{email}</b>. To confirm your
          new account please enter code:
        </p>
        <Form.Group className="input-group" >
        <Form.Control
            autoFocus
            type="code"
            id="signUpVerifyCode"
            placeholder="Confirmation Code"
            onChange={(e) =>
                setSignUpVerifyCode(e.target.value)}
            value={signUpVerifyCode}
          />
        </Form.Group>

        <div className="input-group">
          {!isLoading && 
          <Button
            className="btn form-control submit"
            type="submit"
            disabled={!signUpVerifyCode}
          >
          <i className="fas fa-sign-in-alt" /> Confirm
          </Button>
          }
        </div>
        <hr />
        <div className="input-group">
          {!isLoading &&
          <Button
            className="btn form-control submit"
            type="button"
            onClick={() => forceReload("/signIn")}
          >
          <i className="fas fa-sign-in-alt fa-flip-horizontal" /> Cancel
          </Button>
          }
          {isLoading && 
          <Button
            className="btn form-control submit"
            type="button"
            id="btn-signup" 
          >
            Confirming... &nbsp;
            <i className="fas fa-spinner fa-pulse"></i>
          </Button>
          }
        </div>
      </Form>
    );
});

export default VerifyCodeForm;
