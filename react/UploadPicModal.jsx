import React, { useContext } from 'react'
import { Modal } from 'react-bootstrap';
import storeContext from '../../stores/storeContext';
import { observer } from 'mobx-react';
import PhotoUploader from './PhotoUploader';

const UploadPicModal = observer(() => {
  const store = useContext(storeContext);
  const { modalStore } = store;
  const { showUploadPicModal, setShowUploadPicModal } = modalStore;
  const { show, folder, action } = showUploadPicModal;

  const handleCloseModal = () => setShowUploadPicModal({ show: false, folder: '', action: '' });

  return (
    <Modal
      size='sm'
      aria-labelledby='contained-modal-title-vcenter'
      centered
      show={show}
      onHide={handleCloseModal}
    >
      <PhotoUploader
        folder={folder}
        onSuccess={action}
      />
    </Modal>
  );
})
export default UploadPicModal;