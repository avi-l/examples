import React, { useEffect, useState } from 'react'
import './Profile.css'
import ProfileDisplay from './ProfileDisplay';
import Loading from '../../shared/Loading';
import { isUserLoggedIn, onAuthError } from '../userManagement';
import { withRouter, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import ErrorsModal from '../shared/ErrorsModal';

const Profile = () => {
    const [isLoading, setIsLoading] = useState(true)
    const history = useHistory()
    const urlSearchParams = queryString.parse(history.location.search);
    const profileUserId = urlSearchParams._id;

    useEffect(() => {
        (async () => {
            const res = await isUserLoggedIn(false)
            if (!res.attributes?.sub) return onAuthError()
            setIsLoading(false)
        })()
    }, [])

    if (isLoading) return (<div className='profile-loading'><Loading /></div>)

    return (
        <>
            <ProfileDisplay profileUserId={profileUserId} />
            <ErrorsModal />
        </>
    )
};
export default withRouter(Profile);