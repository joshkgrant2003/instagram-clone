import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, addDoc, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import Avatar from '@mui/material/Avatar';
import './Post.css'

function Post({ postId, user, username, caption, imgUrl }) {
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);

  useEffect(() => {
    let unsub;
    if (postId) {
      // get reference to post doc and comments collection
      const postRef = doc(db, 'posts', postId);
      const commentsRef = collection(postRef, 'comments');

      // create query to order by timestamp
      const commentsQuery = query(commentsRef, orderBy('timestamp', 'desc'));

      // listen to query snapshot
      unsub = onSnapshot(commentsQuery, (snapshot) => {
        setComments(snapshot.docs.map((doc) => doc.data()));
      });
    }

    // cleanup listener
    return () => unsub ? unsub() : null;
  }, [postId]);

  const postComment = async (event) => {
    event.preventDefault();

    // get ref to post doc and comments collection
    const postRef = doc(db, 'posts', postId);
    const commentsRef = collection(postRef, 'comments');

    // add new comment doc to comments collection in db
    await addDoc(commentsRef, {
      text: comment,
      username: user.displayName,
      timestamp: serverTimestamp(),
    });

    setComment('');
  };

    return (
        <div className='post'>
          <div className='postHeader'>
            <Avatar 
              className='postAvatar'
              alt={username}
              src='/static/images/avatar/1.jpg'
            />
            <h3>{username}</h3>
          </div>

          <img 
            className='postImage'
            src={imgUrl} 
            alt=''
          />

          <h4 className='postText'><strong>{username}: </strong>{caption}</h4>

          <div className='postComments'>
            {comments.map((comment) => (
              <p>
                <strong>{comment.username}</strong> {comment.text}
              </p>
            ))}
          </div>

          {user && (
            <form className='postComment'>
              <input 
                className='postCommentInput'
                type='text'
                placeholder='Add a comment...'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                disabled={!comment}
                className='postCommentButton'
                type='submit'
                onClick={postComment}
              >
                Post
              </button>
            </form>
          )}

        </div>
    );
}

export default Post;