import React, { useEffect, useState } from 'react';
import { checkContributorInvite, deactivateCode, getUser } from '../user_api';
import { isUserLoggedIn, logout, updateCognitoUserAttributes } from '../userManagement';
import { forceReload } from '../../../utilities/forceReload';
import { Button, Form } from 'react-bootstrap';
import bcrypt from 'bcryptjs'
import { toast } from 'react-toastify';
import { LoadingIcon } from '../../shared/Loaders';

const VerifyContributorLink = (props) => {
    const [isVerifying, setIsVerifying] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [passphrase, setPassphrase] = useState('')
    const [hashedPass, setHashedPass] = useState('')
    const { contribData: { contributorCode } } = props;
    const EXPIRES_AFTER = 604800000; //seven days in milliseconds
    const MESSAGES = {
        invalidCode: `We are sorry, but ${contributorCode} is not a valid code. ` +
            `please ask for a new Contributor invitation`,
        expiredCode: `We are sorry, but it appears the contributor code: ${contributorCode} ` +
            `has expired. Please check your email to see if you were sent a newer ` +
            `invitation link. If you cannot find one, contact our support department at: support@REPLACE_HOSTNAME.social`,
        usedCode: `Looks like the code: ${contributorCode} is already used`,
        alreadyContributor: `Looks like ${contributorCode} is already used`,
        loggedIn: `Welcome! We see you are already logged in. Would you like us to ` +
            `upgrade your account now to become a Contributor?`,
        invalidURL: `In order to become a contributor, you need a valid invitation link`,
        invalidPass: `Invalid Passphrase`,
        success: `Success! You are now a Contributor on REPLACE_HOSTNAME.Social.`
    };
    useEffect(() => {
        const checkIfAlreadyContrib = async () => {
            try {
                const user = await isUserLoggedIn(true)
                if (!user.attributes?.sub) return false;
                const res = await getUser({ userId: user.attributes.sub })
                return res;
            } catch (error) {
                toast.error(`ERROR: ${error}`,
                    { position: 'top-center', onClose: () => logout() });
                return;
            }
        }

        (async () => {
            const toastOptions = { autoClose: 3000, position: 'top-center', onClose: () => forceReload('/') }
            if (contributorCode) {
                const isCodeValid = await checkContributorInvite({ contributorCode })
                if (!isCodeValid.data?.found) {
                    return toast.error(MESSAGES.invalidCode, toastOptions)
                }
                else if (isCodeValid.data?.isUsed) {
                    return toast.error(MESSAGES.usedCode, toastOptions)
                }
                else if (Date.now() > isCodeValid.data?.created + EXPIRES_AFTER) {
                    return toast.error(MESSAGES.expiredCode, toastOptions)
                }
                else {
                    setHashedPass(isCodeValid.data.hashedPass)
                    const res = await checkIfAlreadyContrib()
                    if (res.data?.contributorCode) {
                        return forceReload('/')
                    }
                    else setIsLoading(false)
                }
            }
        })();
    }, [MESSAGES.expiredCode, MESSAGES.invalidCode, MESSAGES.usedCode, contributorCode])

    const getCognitoUserObject = async () => {
        try {
            const res = await isUserLoggedIn(true);
            return res;
        } catch (err) { return err }
    }
    const maybeLater = () => {
        setIsLoading(true)
        forceReload('/')
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setIsVerifying(true)

        const passMatch = await bcrypt.compare(passphrase.toLowerCase(), hashedPass)
        if (!passMatch) {
            setIsVerifying(false)
            return toast.error(MESSAGES.invalidPass)
        }

        const res = await getCognitoUserObject()
        if (res.attributes?.sub) {
            const cognitoUpdate = await updateCognitoUserAttributes(res, { contributorCode })
            if (cognitoUpdate) {
                await deactivateCode(
                    {
                        code: contributorCode,
                        userId: res.attributes.sub,
                        isUsed: true,
                    })
                toast.success(MESSAGES.success, { position: 'top-center', onClose: () => forceReload('/userCheck') })
            }
        }
    }

    if (isLoading) return (<div style={{textAlign: 'center'}}><LoadingIcon /></div> )

    return (
        <>
            <Form className='login-form-signin' onSubmit={handleSubmit}>
                <Form.Label>Please enter your passphrase to verify your invitation to become a Contributor. </Form.Label>
                <Form.Label>If you just want to continue as a regular user, click 'Maybe Later' </Form.Label>
                <Form.Group className='login-input-group'>
                    <Form.Label>Passphrase</Form.Label>
                    <Form.Control
                        type='text'
                        id='inputPassword'
                        className='form-control'
                        placeholder='Passphrase'
                        value={passphrase}
                        onChange={(e) =>
                            setPassphrase(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className='login-input-group'>
                    <Form.Label>Code</Form.Label>
                    <Form.Control
                        type='text'
                        id='inputCode'
                        className='form-control'
                        placeholder='Code'
                        disabled
                        value={contributorCode}
                    />
                </Form.Group>
                <Form.Group className='login-input-group'>
                    <Button block
                        className='btn login-btn form-control submit'
                        type='submit'
                        disabled={isVerifying || isLoading || !passphrase}>
                        {isVerifying
                            ? <> Verifying... {'   '} <i className='fas fa-spinner fa-pulse'></i> </>
                            : <><i className='fas fa-user-shield' /> Verify Invite</>
                        }
                    </Button>
                    <hr />
                    <Button block
                        className='btn login-btn form-control submit'
                        type='button'
                        disabled={isVerifying || isLoading}
                        onClick={() => maybeLater()}>
                        {isLoading
                            ? <><i className='fas fa-spinner fa-pulse'></i> </>
                            : <><i className='fas fa-home' /> Maybe Later</>
                        }
                    </Button>
                </Form.Group>
            </Form>
        </>

    )
};
export default VerifyContributorLink;