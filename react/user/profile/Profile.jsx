import React, { useEffect, useState } from 'react'
import './Profile.css'
import ProfileDisplay from './ProfileDisplay';
import { isUserLoggedIn, onAuthError } from '../userManagement';
import { withRouter, useHistory } from 'react-router-dom';
import queryString from 'query-string';
import { LoadingIcon } from '../../shared/Loaders';

const Profile = () => {
    const [isLoading, setIsLoading] = useState(true)
    const history = useHistory()
    const urlSearchParams = queryString.parse(history.location.search);
    const profileUserId = urlSearchParams._id;

    useEffect(() => {
        (async () => {
            const res = await isUserLoggedIn(true)
            if (!res.attributes?.sub) return onAuthError()
            setIsLoading(false)
        })()
    }, [])

    if (isLoading) return (<div className='profile-loading'><LoadingIcon /></div>)

    return (
        <>
            <ProfileDisplay profileUserId={profileUserId} />
        </>
    )
};
export default withRouter(Profile);