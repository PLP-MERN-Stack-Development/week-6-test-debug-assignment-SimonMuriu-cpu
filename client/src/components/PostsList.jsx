import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './PostsList.css';

const PostsList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: 'published'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchPosts();
  }, [filters, pagination.page]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });

      const response = await fetch(`/api/posts?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || data);
        setPagination(prev => ({
          ...prev,
          total: data.pagination?.total || data.length,
          pages: data.pagination?.pages || 1
        }));
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: 'published'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading && posts.length === 0) {
    return (
      <div className="posts-loading">
        <div className="loading-spinner"></div>
        <p>Loading posts...</p>
      </div>
    );
  }

  return (
    <div className="posts-list" data-testid="posts-content">
      <div className="posts-header">
        <h1>All Posts</h1>
        <Link to="/posts/create" className="create-post-btn">
          Create New Post
        </Link>
      </div>

      <div className="posts-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search posts..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
            data-testid="search-input"
          />
          <button 
            onClick={fetchPosts}
            className="search-button"
            data-testid="search-button"
          >
            Search
          </button>
        </div>

        <div className="filter-group">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="filter-select"
            data-testid="category-filter"
          >
            <option value="">All Categories</option>
            <option value="Technology">Technology</option>
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Lifestyle">Lifestyle</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="">All Status</option>
          </select>

          <button 
            onClick={clearFilters}
            className="clear-filters-btn"
            data-testid="clear-filters"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <p>Error: {error}</p>
          <button onClick={fetchPosts}>Retry</button>
        </div>
      )}

      <div className="posts-grid" data-testid="post-list">
        {posts.length > 0 ? (
          posts.map(post => (
            <div key={post._id} className="post-card" data-testid="post-item">
              <div className="post-content">
                <h3>
                  <Link to={`/posts/${post._id}`}>{post.title}</Link>
                </h3>
                <p className="post-excerpt">
                  {post.content.substring(0, 150)}...
                </p>
                <div className="post-meta">
                  <span className="post-author">
                    By {post.author?.username || 'Unknown'}
                  </span>
                  <span className="post-date">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  <span className={`post-status ${post.status}`}>
                    {post.status}
                  </span>
                </div>
                <div className="post-stats">
                  <span>{post.views || 0} views</span>
                  <span>{post.likes?.length || 0} likes</span>
                  <span>{post.comments?.length || 0} comments</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-posts">
            <p>No posts found matching your criteria.</p>
            <Link to="/posts/create" className="create-first-post">
              Create Your First Post
            </Link>
          </div>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <div className="pagination-info">
            Page {pagination.page} of {pagination.pages}
          </div>
          
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default PostsList;