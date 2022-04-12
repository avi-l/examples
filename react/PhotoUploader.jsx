import React, { useState, useContext } from 'react'
import storeContext from '../../stores/storeContext';
import { observer } from 'mobx-react';
import { signCloudindaryURL } from '../user/user_api'
import { isUserLoggedIn, logout } from '../user/userManagement'
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import Dropzone from 'react-dropzone'
import './PhotoUploader.css'
import { toast } from 'react-toastify';
import { LoadingIcon } from './Loaders';

const PhotoUploader = observer((props) => {
    const { folder, onSuccess } = props;
    const uploadFolder = folder ? folder : 'general'
    const [isLoading, setIsLoading] = useState(false);
    const [imageSrc, setImageSrc] = useState(null);
    const [image, setImage] = useState([]);
    const store = useContext(storeContext);
    const { userStore } = store;
    const { user } = userStore;
    const CLOUDINARY_API_KEY = '423739633836172';
    const CLOUDINARY_UPLOAD_URL = 'https://api.cloudinary.com/v1_1/REPLACE_HOSTNAME/image/upload'

    const handleImageSelect = (e) => {
        setImageSrc(URL.createObjectURL(e[0]))
        setImage((e[0]))
    }
    const handleClose = () => {
        setIsLoading(false)
        setImage([])
        setImageSrc(null)
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const { attributes } = await isUserLoggedIn(true);
        if (attributes?.sub !== user.userId) {
            return toast.error('There was a problem with your credentials, please log in again',
                { position: 'top-center', onClose: () => logout() })
        }
        try {
            const res = await signCloudindaryURL({ folder: uploadFolder });
            const formData = new FormData();
            formData.append("file", image);
            formData.append("api_key", CLOUDINARY_API_KEY);
            formData.append("eager", "w_150,h_150,c_crop");
            formData.append("folder", uploadFolder);
            formData.append("public_id", res.data.timestamp);
            formData.append("timestamp", res.data.timestamp);
            formData.append("signature", res.data.signature);

            const response = await fetch(CLOUDINARY_UPLOAD_URL, {
                method: "POST",
                body: formData,
            });

            const data = await response.json();
            onSuccess && onSuccess(data.secure_url);
        } catch (err) {
            return err;
        } finally {
            handleClose();
        }
    };

    return (
        <div className='photoUploader-Container'>
            <Card className='photoUploader-Container'>
                <Card.Body className='photoUploader-imgDropzone'>
                    <Dropzone onDrop={acceptedFiles => handleImageSelect(acceptedFiles)}>
                        {({ getRootProps, getInputProps }) => (
                            <section>
                                <div {...getRootProps()}>
                                    <input {...getInputProps()} />
                                    {imageSrc
                                        ? <Card.Img variant='top' className='photoUploader-imgDropzoneThumb' src={imageSrc} />
                                        : <>
                                            <i className='fas fa-cloud-upload-alt fa-5x photoUploader-imgDropzoneThumb' />
                                            <Card.Text>Drag 'n' drop or click to select image</Card.Text>
                                        </>
                                    }
                                </div>
                            </section>
                        )}
                    </Dropzone>
                </Card.Body>
                {imageSrc &&
                    <Card.Footer className='photoUploader-btnGroup'>
                        {!isLoading ?
                            <>
                                <Button block
                                    variant='outline-primary'
                                    disabled={isLoading}
                                    onClick={handleSubmit}
                                >
                                    Upload
                                </Button>
                                <Button block 
                                    variant='outline-secondary'
                                    onClick={handleClose}
                                >
                                    Cancel
                                </Button>
                            </>
                            : <LoadingIcon />
                        }
                    </Card.Footer>
                }
            </Card>
        </div>
    )
})

export default PhotoUploader;