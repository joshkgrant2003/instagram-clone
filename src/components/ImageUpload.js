import { useState } from "react";
import { Button } from "@mui/material";
import { db, auth, storage } from '../firebase';
import { ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import './ImageUpload.css';

function ImageUpload({ username }) {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleChange = (e) => {
    // grabs first image file selected
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  }

  const handleUpload = () => {
    const imageRef = ref(storage, `images/${image.name}`);
    const uploadTask = uploadBytesResumable(imageRef, image);
    
    // logic for progress of image upload
    uploadTask.on(
      "state_changed",
      // logic for filling progress bar
      (snapshot) => {
        const progress = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );
        setProgress(progress);
      },
      // display any errors
      (error) => {
        console.error(error);
        alert(error.message);
      },
      // handle completed upload
      () => {
        getDownloadURL(uploadTask.snapshot.ref)
          .then((url) => {
            addDoc(collection(db, 'posts'), {
              userId: auth.currentUser.uid,
              timestamp: serverTimestamp(),
              username: username,
              caption: caption,
              imgUrl: url,
            });
          
          // reset state
          setCaption('');
          setImage(null);
          setProgress(0);
        });
      }
    );
  }
  
  return (
    <div className='imageupload'>
      <progress className='imageuploadProgressBar' value={progress} max='100' />
      <input 
        className='imageuploadInput'
        type='text' 
        placeholder='Enter a caption...'
        onChange={event => setCaption(event.target.value)}
        value={caption}
      />
      <input className='imageuploadFile' type='file' onChange={handleChange}/>
      <Button onClick={handleUpload}>
        Upload
      </Button>
    </div>
  );
}

export default ImageUpload;