import React, { useState, useContext } from 'react'
import { Form, Modal, Button } from 'react-bootstrap';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';
import { signCloudindaryURL, updateUserDetails } from '../user_api'
import { isUserLoggedIn, logout } from '../userManagement'
import FormData from 'form-data'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './UploadPicModal.css'

const UploadPicModal = observer(() => {
  const [isLoading, setIsLoading] = useState(false);
  const [image, setImage] = useState([])
  const [{ alt, src }, setImgUrl] = useState({
    src: "http://100dayscss.com/codepen/upload.svg",
    alt: 'Upload an Image'
  });
  const store = useContext(storeContext);
  const { modalStore, userStore } = store;
  const { profileUser, setProfileUser } = userStore;
  const { showUploadPicModal, setShowUploadPicModal } = modalStore;
  const CLOUDINARY_API_KEY = "88888888888";
  const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/cloudinary/image/upload"
  const toastOptions = {
    position: "top-right",
    autoClose: 2000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    onClose: () => handleClose()
  }

  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImgUrl({
        src: URL.createObjectURL(e.target.files[0]),
        alt: e.target.files[0].name
      });
      setImage((e.target.files[0]))
    }
  }

  const handleClose = () => {
    setIsLoading(false)
    setImage([])
    setImgUrl({
      src: "http://100dayscss.com/codepen/upload.svg",
      alt: 'Upload an Image'
    })
    setShowUploadPicModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true)
    const { attributes } = await isUserLoggedIn(true)

    if (attributes?.sub === profileUser.userId) {
      await signCloudindaryURL()
        .then(res => {
          const formData = new FormData()
          formData.append("file", image)
          formData.append("api_key", CLOUDINARY_API_KEY);
          formData.append("eager", "w_150,h_150,c_crop");
          formData.append("folder", "avatars");
          formData.append("public_id", res.data.timestamp);
          formData.append("timestamp", res.data.timestamp);
          formData.append("signature", res.data.signature);

          fetch(CLOUDINARY_UPLOAD_URL, {
            method: "POST",
            body: formData
          })
            .then((res) => {
              return res.json()
            })
            .then((data) => {
              updateUserDetails({ userId: profileUser.userId, avatar: data.secure_url })
                .then(res => {
                  setProfileUser({ ...profileUser, avatar: data.secure_url })
                  toast.success("Image Updated!", toastOptions);
                })
                .catch(err => console.error(err))

            })
            .catch(err => {
              toast.error(`${err}`, toastOptions)
            })
        })
        .catch(err => {
          toast.error(`${err}`, toastOptions)
        })
    }
    else {
      return toast.error(`Oops, ${profileUser.userHandle} is not authenticated. Please log in again`,
        { onClose: () => logout() }
      )
    }
  };

  return (
    <Modal
      size='md'
      dialogClassName='modal-add-pic'
      centered
      show={showUploadPicModal}
      onHide={handleClose}
    >

      <Form className="upload-image" onSubmit={handleSubmit}>
        <div className="upload-image-frame">
          <div className="upload-image-center">
            <div className="upload-image-title">
              Drop file or click cloud to upload
            </div>
            <div className="upload-image-dropzone">
              <img src={src} alt={alt} className="upload-image-upload-icon" style={{ width: "100px", height: "70px" }} />
              <input type="file" className="upload-image-upload-input" accept=".png, .jpg, .jpeg" onChange={handleImg} />
            </div>
            {!isLoading &&
              alt !== 'Upload an Image' &&
              <Button type="submit" className="btn" name="uploadbutton">Upload file</Button>
            }
            {!isLoading &&
              <Button type="button" className="btn" onClick={handleClose}>Cancel</Button>
            }
            {isLoading &&
              <Button className="btn" type="button">
                Uploading... &nbsp;
                <i className="fas fa-spinner fa-pulse"></i>
              </Button>
            }
          </div>
        </div>
      </Form>
    </Modal>
  );
})
export default UploadPicModal;