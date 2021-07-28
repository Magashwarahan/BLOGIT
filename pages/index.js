 import Loader from '../components/Loader'
import Metatags from '../components/Metatags'

import PostFeed from '../components/PostFeed';
import { firestore, fromMillis, postToJSON } from '../lib/firebase';

import { useState } from 'react';


const LIMIT = 10;

export async function getServerSideProps(context) {
  const postsQuery = firestore
    .collectionGroup('posts')
    .where('published', '==', true)
    .orderBy('createdAt', 'desc')
    .limit(LIMIT);

  const posts = (await postsQuery.get()).docs.map(postToJSON);

  return {
    props: { posts }, 
  };
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);

  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const cursor = typeof last.createdAt === 'number' ? fromMillis(last.createdAt) : last.createdAt;

    const query = firestore
      .collectionGroup('posts')
      .where('published', '==', true)
      .orderBy('createdAt', 'desc')
      .startAfter(cursor)
      .limit(LIMIT);

    const newPosts = (await query.get()).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <Metatags title="Home Page" description="Get the latest posts on our site" />

      <div className="card card-info">
        <h2>💡BLOGIN</h2>
        <p>BLOGIN Welcomes you all!!!</p>
        <p>This is a broad platform where it enables people from different sections to get connected through their inspiring piece of quotes, information,stories,scientific facts and much more. So that viewers can gain insights by giving a read.</p>
        <p>Like if you guys love it,share if you wish to spread the world!!!</p>
        <p> Just Sign up for an 👨‍🎤 account, ✍️ write posts, then 💞 heart content created by other users.</p>
        <p className="from">From Magashwarahan</p>
      </div>
     
      <PostFeed posts={posts} />

      {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button>}

      <Loader show={loading} />

      {postsEnd && 'You have reached the end!'}
    </main>
  );
}
