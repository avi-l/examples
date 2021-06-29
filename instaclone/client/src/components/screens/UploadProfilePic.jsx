import React, { useState, useEffect, useContext } from 'react'
import M from 'materialize-css'
import { useHistory } from 'react-router-dom'
import {UserContext} from '../../App'



const UploadProfilePic = () => {
    const {state, dispatch} = useContext(UserContext)
    const [image, setImage] = useState("")
    const [url, setUrl] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const history = useHistory();
    useEffect(() => {
        if (url) {
            fetch("/profilepic", {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("jwt")
                },
                body: JSON.stringify({
                    pic: url
                })
            }).then(res => res.json())
                .then(data => {
                    if (data.error) {
                        M.toast({ html: data.error, classes: "#ff5252 red accent-2" })
                        setIsLoading(false)
                    }
                    else {
                        console.log(`DATA: ${JSON.stringify(data)}`)
                        M.toast({ html: "Image Uploaded!", classes: "#43a047 green darken-1" })
                        dispatch({type:"USER",payload:data})
                        setIsLoading(false)
                        history.push('/profile')
                    }
                    console.log(data)
                }).catch(err => {
                    setIsLoading(false)
                    console.log(err)
                })
            }
        }, [url]);
    const postDetails = () => {
        setIsLoading(true)
        const data = new FormData()
        data.append("file", image)
        data.append("upload_preset", "instasham")
        data.append("cloudname", "devuploads")
        fetch("https://api.cloudinary.com/v1_1/devuploads/image/upload", {
            method: "post",
            body: data
        })
            .then(res => res.json())
            .then(data => {
                console.log(data)
                if (data.error) {
                    setIsLoading(false)
                    return M.toast({ html: data.error.message, classes: "#ff5252 red accent-2" })
                }
                else {
                    setUrl(data.url)
                }
                console.log(data)
            }).catch(err => {
                setIsLoading(false)
                console.log(err)
            })

    }
    return (
        <div className="card input-field"
            style={{
                margin: "30px auto",
                maxWidth: "500px",
                padding: "20px",
                textAlign: "center"
            }}>
            <div className="file-field input-field">
                <div className="btn #64b5f6 blue darken-1">
                    <span>Upload Image</span>
                    <input type="file" onChange={(e) => setImage(e.target.files[0])} />
                </div>
                <div className="file-path-wrapper">
                    <input className="file-path validate" type="text" />
                </div>
            </div>
            <button className="btn waves-effect waves-light #64b5f6 blue darken-1"
                onClick={() => postDetails()}>
                Submit
                </button>
                {isLoading && 
                  <div className="progress">
                  <div className="indeterminate"></div>
              </div>
               }
        </div>
    )

}
export default UploadProfilePic;