import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import HomePage from './routes/HomePage';
import NewPostPage from './routes/NewPostPage';
import SigninPage from './routes/SigninPage';
import SignupPage from './routes/SignupPage';
import Profile from './routes/UserProfilePage';
import UserPostsPage from './routes/UserPostsPage';
import AllUsersPage from './routes/AllUsersPage.jsx';
import AllPostsPage from './routes/AllPostsPage';
import AllTagsPage from './routes/AllTagsPage.jsx';
import SearchPage from './routes/SearchPage.jsx';
import DetailedPostViewPage from './routes/DetailedPostViewPage.jsx';
import DetailedUserViewPage from './routes/DetailedUserViewPage.jsx';
import DeatiledTagsViewPage from './routes/DetailedTagViewPage.jsx';
import FollowersPage from './routes/FollowersPage.jsx';
import FollowingPage from './routes/FollowingPage.jsx';
import {Routes, Route} from 'react-router-dom';
import ProtectedRoute from './ProtectedRoutes.js';

function App() {
  return (
    <div>
      <Routes>
          {/* Public route */}
          <Route path='signin' element={<SigninPage />}/>
          <Route path='signup' element={<SignupPage />}/>
          <Route path="users" element={<AllUsersPage />} />
          <Route path='posts' element={<AllPostsPage />}/>
          <Route path='tags' element={<AllTagsPage />}/>
          <Route path='search' element={<SearchPage />}/>
          <Route path="post/:id" element={<DetailedPostViewPage />} />
          <Route path="user/:id" element={<DetailedUserViewPage />} />
          <Route path="tag/:id" element={<DeatiledTagsViewPage />} />
          <Route path="user/:id/followers" element={<FollowersPage />} />
          <Route path="user/:id/following" element={<FollowingPage />} />
          
          {/* Protected route */}
          <Route path='newpost' element={<ProtectedRoute><NewPostPage /></ProtectedRoute>}/>
          <Route path='myprofile' element={<ProtectedRoute><Profile /></ProtectedRoute>}/>
          <Route path='myprofile/:id/followers' element={<ProtectedRoute><FollowersPage /></ProtectedRoute>}/>
          <Route path='myprofile/:id/following' element={<ProtectedRoute><FollowingPage /></ProtectedRoute>}/>
          <Route path='myposts' element={<ProtectedRoute><UserPostsPage /></ProtectedRoute>}/>

          {/* Fallback route */}
          <Route index element={<HomePage />}/>
      </Routes>
    </div>
  );
}

export default App;
