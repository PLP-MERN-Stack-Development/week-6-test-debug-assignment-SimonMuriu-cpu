import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0
  });
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch user stats
      const statsResponse = await fetch('/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent posts
      const postsResponse = await fetch('/api/posts?limit=5&sort=-createdAt', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (postsResponse.ok) {
        const postsData = await postsResponse.json();
        setRecentPosts(postsData.posts || postsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard" data-testid="dashboard-content">
      <div className="dashboard-header">
        <h1 data-testid="welcome-message">
          Welcome back, {user?.username || 'User'}!
        </h1>
        <p className="dashboard-subtitle">
          Here's what's happening with your content today.
        </p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-number">{stats.totalPosts}</div>
          <div className="stat-label">Total Posts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.publishedPosts}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.draftPosts}</div>
          <div className="stat-label">Drafts</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalViews}</div>
          <div className="stat-label">Total Views</div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link 
          to="/posts/create" 
          className="action-button primary"
          data-testid="create-post-button"
        >
          Create New Post
        </Link>
        <Link 
          to="/posts" 
          className="action-button secondary"
        >
          View All Posts
        </Link>
        <Link 
          to="/profile" 
          className="action-button secondary"
        >
          Edit Profile
        </Link>
      </div>

      <div className="dashboard-section">
        <h2>Recent Posts</h2>
        {recentPosts.length > 0 ? (
          <div className="recent-posts">
            {recentPosts.map(post => (
              <div key={post._id} className="post-item" data-testid="recent-post">
                <div className="post-info">
                  <h3>
                    <Link to={`/posts/${post._id}`}>{post.title}</Link>
                  </h3>
                  <p className="post-meta">
                    {post.status} • {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="post-stats">
                  <span>{post.views || 0} views</span>
                  <span>{post.likes?.length || 0} likes</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No posts yet. Create your first post to get started!</p>
            <Link 
              to="/posts/create" 
              className="action-button primary"
            >
              Create Your First Post
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;