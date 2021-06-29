import React, { useEffect, useState, useContext } from 'react'
import { UserContext } from '../../App'
import {Link} from 'react-router-dom'
const Profile = () => {
    const [myPics, setMyPics] = useState([])
    const { state, dispatch } = useContext(UserContext)

    useEffect(() => {
        fetch('/mypost', {
            headers: {
                "Authorization": "Bearer " + localStorage.getItem("jwt")
            }
        }).then(res => res.json())
            .then(result => {
                console.log(result)
                setMyPics(result.mypost)
            })
            console.log(state)
    }, [state])

    return (
        <>
        {/* {state ? */}
        <div style={{ maxWidth: "550px", margin: "0px auto" }}>
            <div style={{
                display: "flex",
                justifyContent: "space-around",
                margin: "18px 0px",
                borderBottom: "1px solid grey"
            }}>
                <div>
                
                    <img style={{ width: "160px", height: "160px", borderRadius: "80px", margin: "10px" }}
                        src={state?.profilepic} alt="" />
                        <Link to="/profilepic"><i className="material-icons">add_a_photo</i></Link>
                </div>
                <div>
                    <h4>{state ? state.name : "Loading"}</h4>
                    <h5>{state ? state.email : "Loading"}</h5>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: "108%",
                    }}>
                        <h6>{state ? myPics.length : "Loading"} posts</h6>
                        <h6>{state ? state.followers?.length : "Loading"} followers</h6>
                        <h6>{state ? state.following?.length : "Loading"} following</h6>
                    </div>
                </div>
            </div>
            <div className="gallery">
                {
                    myPics.map(item => {
                        return (
                            <img key={item._id} className="item" style={{ width: "160px", height: "160px" }} src={item.photo} alt={item.title} />
                        )
                    })
                }


            </div>
        </div>
        {/* :<h2>Loading... </h2>} */}
        </>
    )

}
export default Profile;