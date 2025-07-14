import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import AuthFlow from './components/AuthFlow';
import Dashboard from './components/Dashboard';
import PostsList from './components/PostsList';
import PostDetail from './components/PostDetail';
import CreatePost from './components/CreatePost';
import EditPost from './components/EditPost';
import Profile from './components/Profile';
import NotFound from './components/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <Router>
          <div className="app">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<AuthFlow />} />
              <Route path="/register" element={<AuthFlow />} />
              
              {/* Protected routes */}
              <Route path="/" element={<ProtectedRoute><Navigate to="/dashboard" replace /></ProtectedRoute>} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Navigation />
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/posts" element={
                <ProtectedRoute>
                  <Navigation />
                  <PostsList />
                </ProtectedRoute>
              } />
              <Route path="/posts/create" element={
                <ProtectedRoute>
                  <Navigation />
                  <CreatePost />
                </ProtectedRoute>
              } />
              <Route path="/posts/:id" element={
                <ProtectedRoute>
                  <Navigation />
                  <PostDetail />
                </ProtectedRoute>
              } />
              <Route path="/posts/:id/edit" element={
                <ProtectedRoute>
                  <Navigation />
                  <EditPost />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Navigation />
                  <Profile />
                </ProtectedRoute>
              } />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </ErrorBoundary>
    </Provider>
  );
}

export default App;