import { useState, useEffect } from 'react';
import Post from './components/Post';
import ImageUpload from './components/ImageUpload';
import { db, auth } from './firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { Modal, Box, Button, Input } from '@mui/material';
import { InstagramEmbed } from 'react-social-media-embed';
import './App.css';

function App() {

  const [posts, setPosts] = useState([]);
  const [openSignUp, setOpenSignUp] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((authUser) => {
      if (authUser) {
        // usr logged in
        console.log('AUTH USER', authUser);
        setUser(authUser);
      } else {
        // usr logged out
        setUser(null);
      }
    });

    // cleanup function unsubscribes from firestore updates when component unmounts
    return () => unsub();
  }, [user, username]);

  useEffect(() => {
    // listens to realtime updates and grabs posts from db
    const unsub = onSnapshot(
      query(collection(db, 'posts'), orderBy('timestamp', 'desc')), 
        (snapshot) => {
          setPosts(snapshot.docs.map(doc => ({
            id: doc.id,
            post: doc.data()
          })));
        }
    );

    // cleanup function unsubscribes from firestore updates when component unmounts
    return () => unsub();
  }, []);

  const signIn = (event) => {
    // prevent refresh
    event.preventDefault();

    // sign in existing usr with email/pwrd in firebase
    signInWithEmailAndPassword(auth, email, password)
      .catch((error) => alert(error.message));
      console.log('AUTH IS HERE:', auth);
    
    setOpenSignIn(false);
  };

  const signUp = (event) => {
    // prevent refresh
    event.preventDefault();

    // create new usr with email/pwrd in firebase
    createUserWithEmailAndPassword(auth, email, password)
      .then((authUser) => {
        updateProfile(authUser.user, {
          displayName: username,
        });
        setUser(authUser.user);
      })
      .catch((error) => alert(error.message));
    
      setOpenSignUp(false);
  }

  return (
    <div className='app'>

      <div className='appHeader'>
        <img 
          className='appHeaderImage'
          src='https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png'
          alt=''
        />
        {user ? (
          <Button sx={{border: '1px solid lightblue'}} onClick={() => auth.signOut()}>Logout</Button>
        ): (
          <div className='appLoginContainer'>
            <Button sx={{border: '1px solid lightblue'}} onClick={() => setOpenSignIn(true)}>Sign In</Button>
            <Button sx={{border: '1px solid lightblue'}} onClick={() => setOpenSignUp(true)}>Sign Up</Button>
          </div>
        )}
      </div>

      <Modal
        open={openSignUp}
        onClose={() => setOpenSignUp(false)}
      >
        <Box className='appModal'>
          <form className='appSignUp'>
            <center>
              <img 
                className='appHeaderImage'
                src='https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png'
                alt=''
              />
            </center>
            
            <Input 
              placeholder='username'
              type='text'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input 
              placeholder='email'
              type='text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              placeholder='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              sx={{border: '1px solid lightblue', marginTop: 1}} 
              type='submit' 
              onClick={signUp}
            >
              Sign Up
            </Button>
          </form>
        </Box>
      </Modal>

      <Modal
        open={openSignIn}
        onClose={() => setOpenSignIn(false)}
      >
        <Box className='appModal'>
          <form className='appSignUp'>
            <center>
              <img 
                className='appHeaderImage'
                src='https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png'
                alt=''
              />
            </center>
            
            <Input 
              placeholder='email'
              type='text'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input 
              placeholder='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              sx={{border: '1px solid lightblue', marginTop: 1}} 
              type='submit' 
              onClick={signIn}
            >
              Sign In
            </Button>
          </form>
        </Box>
      </Modal>

      <div className='appPosts'>
        <div className='appPostsLeft'>
          {
            posts.map(({id, post}) => (
              <Post key={id} postId={id} user={user} username={post.username} caption={post.caption} imgUrl={post.imgUrl}/>
            ))
          }
        </div>
        <div className='appPostsRight'>
          <InstagramEmbed 
            url="https://www.instagram.com/p/CUbHfhpswxt/" 
            width={328} 
            captioned 
          />
        </div>
      </div>
      
      <div className='appUploader'>
        {user ? (
          <ImageUpload username={user.displayName}/>
        ) : (
          <h3 className='appLoginPush' >Login to upload!</h3>
        )}
      </div>

    </div>
  );
}

export default App;
