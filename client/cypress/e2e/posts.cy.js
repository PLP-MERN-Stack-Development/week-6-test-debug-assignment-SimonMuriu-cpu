describe('Posts Management', () => {
  beforeEach(() => {
    cy.cleanupTestData();
    cy.register({
      username: 'postuser',
      email: 'posts@example.com',
      password: 'Password123'
    });
    cy.visit('/dashboard');
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Create Post', () => {
    it('should create a new post successfully', () => {
      // Navigate to create post page
      cy.get('[data-testid="create-post-button"]').click();
      cy.url().should('include', '/posts/create');
      
      // Fill post form
      cy.get('[data-testid="post-title"]').type('My First Blog Post');
      cy.get('[data-testid="post-content"]').type('This is the content of my first blog post. It contains some interesting information.');
      cy.get('[data-testid="post-category"]').select('Technology');
      cy.get('[data-testid="post-tags"]').type('javascript, react, testing');
      
      // Submit form
      cy.get('[data-testid="submit-post"]').click();
      
      // Should redirect to post view
      cy.url().should('match', /\/posts\/[a-f0-9]{24}/);
      cy.get('[data-testid="post-title"]').should('contain', 'My First Blog Post');
      cy.get('[data-testid="post-content"]').should('contain', 'This is the content of my first blog post');
    });

    it('should show validation errors for empty required fields', () => {
      cy.get('[data-testid="create-post-button"]').click();
      
      // Submit empty form
      cy.get('[data-testid="submit-post"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="title-error"]').should('contain', 'Title is required');
      cy.get('[data-testid="content-error"]').should('contain', 'Content is required');
      cy.get('[data-testid="category-error"]').should('contain', 'Category is required');
    });

    it('should save post as draft', () => {
      cy.get('[data-testid="create-post-button"]').click();
      
      cy.get('[data-testid="post-title"]').type('Draft Post');
      cy.get('[data-testid="post-content"]').type('This is a draft post content.');
      cy.get('[data-testid="post-category"]').select('Technology');
      
      // Save as draft
      cy.get('[data-testid="save-draft"]').click();
      
      // Should show success message
      cy.get('[data-testid="success-message"]').should('contain', 'Post saved as draft');
      
      // Should be in drafts list
      cy.visit('/dashboard/drafts');
      cy.get('[data-testid="draft-post"]').should('contain', 'Draft Post');
    });
  });

  describe('View Posts', () => {
    beforeEach(() => {
      // Create test posts
      cy.createPost({
        title: 'Published Post',
        content: 'This is a published post content.',
        status: 'published'
      });
      
      cy.createPost({
        title: 'Draft Post',
        content: 'This is a draft post content.',
        status: 'draft'
      });
    });

    it('should display list of published posts', () => {
      cy.visit('/posts');
      
      cy.get('[data-testid="post-list"]').should('be.visible');
      cy.get('[data-testid="post-item"]').should('have.length.at.least', 1);
      cy.get('[data-testid="post-item"]').first().should('contain', 'Published Post');
    });

    it('should view individual post', () => {
      cy.visit('/posts');
      
      // Click on first post
      cy.get('[data-testid="post-item"]').first().click();
      
      // Should navigate to post detail page
      cy.url().should('match', /\/posts\/[a-f0-9]{24}/);
      cy.get('[data-testid="post-title"]').should('be.visible');
      cy.get('[data-testid="post-content"]').should('be.visible');
      cy.get('[data-testid="post-author"]').should('contain', 'postuser');
    });

    it('should filter posts by category', () => {
      cy.visit('/posts');
      
      // Select category filter
      cy.get('[data-testid="category-filter"]').select('Technology');
      
      // Should show filtered results
      cy.get('[data-testid="post-item"]').should('have.length.at.least', 1);
      
      // Clear filter
      cy.get('[data-testid="clear-filters"]').click();
      cy.get('[data-testid="post-item"]').should('have.length.at.least', 1);
    });

    it('should search posts', () => {
      cy.visit('/posts');
      
      // Search for specific post
      cy.get('[data-testid="search-input"]').type('Published');
      cy.get('[data-testid="search-button"]').click();
      
      // Should show search results
      cy.get('[data-testid="post-item"]').should('contain', 'Published Post');
    });
  });

  describe('Edit Post', () => {
    let postId;

    beforeEach(() => {
      cy.createPost({
        title: 'Editable Post',
        content: 'This post will be edited.',
        status: 'published'
      }).then((response) => {
        postId = response.body._id;
      });
    });

    it('should edit post successfully', () => {
      cy.visit(`/posts/${postId}/edit`);
      
      // Update post content
      cy.get('[data-testid="post-title"]').clear().type('Updated Post Title');
      cy.get('[data-testid="post-content"]').clear().type('This post has been updated with new content.');
      
      // Save changes
      cy.get('[data-testid="update-post"]').click();
      
      // Should show success message
      cy.get('[data-testid="success-message"]').should('contain', 'Post updated successfully');
      
      // Should redirect to post view with updated content
      cy.url().should('include', `/posts/${postId}`);
      cy.get('[data-testid="post-title"]').should('contain', 'Updated Post Title');
    });

    it('should not allow editing other users posts', () => {
      // Create another user and their post
      cy.logout();
      cy.register({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'Password123'
      });
      
      // Try to access edit page for original user's post
      cy.visit(`/posts/${postId}/edit`);
      
      // Should show access denied or redirect
      cy.get('[data-testid="access-denied"]').should('be.visible');
    });
  });

  describe('Delete Post', () => {
    let postId;

    beforeEach(() => {
      cy.createPost({
        title: 'Deletable Post',
        content: 'This post will be deleted.',
        status: 'published'
      }).then((response) => {
        postId = response.body._id;
      });
    });

    it('should delete post successfully', () => {
      cy.visit(`/posts/${postId}`);
      
      // Click delete button
      cy.get('[data-testid="delete-post"]').click();
      
      // Confirm deletion in modal
      cy.get('[data-testid="confirm-delete"]').click();
      
      // Should show success message and redirect
      cy.get('[data-testid="success-message"]').should('contain', 'Post deleted successfully');
      cy.url().should('include', '/dashboard');
      
      // Post should no longer exist
      cy.visit(`/posts/${postId}`);
      cy.get('[data-testid="not-found"]').should('be.visible');
    });

    it('should cancel deletion', () => {
      cy.visit(`/posts/${postId}`);
      
      // Click delete button
      cy.get('[data-testid="delete-post"]').click();
      
      // Cancel deletion in modal
      cy.get('[data-testid="cancel-delete"]').click();
      
      // Should remain on post page
      cy.url().should('include', `/posts/${postId}`);
      cy.get('[data-testid="post-title"]').should('contain', 'Deletable Post');
    });
  });

  describe('Post Interactions', () => {
    let postId;

    beforeEach(() => {
      cy.createPost({
        title: 'Interactive Post',
        content: 'This post supports interactions.',
        status: 'published'
      }).then((response) => {
        postId = response.body._id;
      });
    });

    it('should like and unlike a post', () => {
      cy.visit(`/posts/${postId}`);
      
      // Initially no likes
      cy.get('[data-testid="like-count"]').should('contain', '0');
      
      // Like the post
      cy.get('[data-testid="like-button"]').click();
      cy.get('[data-testid="like-count"]').should('contain', '1');
      cy.get('[data-testid="like-button"]').should('have.class', 'liked');
      
      // Unlike the post
      cy.get('[data-testid="like-button"]').click();
      cy.get('[data-testid="like-count"]').should('contain', '0');
      cy.get('[data-testid="like-button"]').should('not.have.class', 'liked');
    });

    it('should add and display comments', () => {
      cy.visit(`/posts/${postId}`);
      
      // Add a comment
      cy.get('[data-testid="comment-input"]').type('This is a great post!');
      cy.get('[data-testid="submit-comment"]').click();
      
      // Should display the comment
      cy.get('[data-testid="comment-list"]').should('contain', 'This is a great post!');
      cy.get('[data-testid="comment-author"]').should('contain', 'postuser');
    });
  });
});