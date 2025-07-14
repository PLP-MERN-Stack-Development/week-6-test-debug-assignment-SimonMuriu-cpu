describe('Navigation and Routing', () => {
  beforeEach(() => {
    cy.cleanupTestData();
    cy.register({
      username: 'navuser',
      email: 'nav@example.com',
      password: 'Password123'
    });
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('Main Navigation', () => {
    it('should navigate through main menu items', () => {
      cy.visit('/dashboard');
      
      // Test dashboard navigation
      cy.get('[data-testid="nav-dashboard"]').click();
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="dashboard-content"]').should('be.visible');
      
      // Test posts navigation
      cy.get('[data-testid="nav-posts"]').click();
      cy.url().should('include', '/posts');
      cy.get('[data-testid="posts-content"]').should('be.visible');
      
      // Test profile navigation
      cy.get('[data-testid="nav-profile"]').click();
      cy.url().should('include', '/profile');
      cy.get('[data-testid="profile-content"]').should('be.visible');
    });

    it('should show active navigation state', () => {
      cy.visit('/dashboard');
      
      // Dashboard should be active
      cy.get('[data-testid="nav-dashboard"]').should('have.class', 'active');
      
      // Navigate to posts
      cy.get('[data-testid="nav-posts"]').click();
      cy.get('[data-testid="nav-posts"]').should('have.class', 'active');
      cy.get('[data-testid="nav-dashboard"]').should('not.have.class', 'active');
    });

    it('should work with browser back/forward buttons', () => {
      cy.visit('/dashboard');
      
      // Navigate to posts
      cy.get('[data-testid="nav-posts"]').click();
      cy.url().should('include', '/posts');
      
      // Navigate to profile
      cy.get('[data-testid="nav-profile"]').click();
      cy.url().should('include', '/profile');
      
      // Use browser back button
      cy.go('back');
      cy.url().should('include', '/posts');
      
      // Use browser forward button
      cy.go('forward');
      cy.url().should('include', '/profile');
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      cy.viewport('iphone-x');
    });

    it('should toggle mobile menu', () => {
      cy.visit('/dashboard');
      
      // Mobile menu should be hidden initially
      cy.get('[data-testid="mobile-menu"]').should('not.be.visible');
      
      // Click hamburger menu
      cy.get('[data-testid="menu-toggle"]').click();
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
      
      // Click menu item
      cy.get('[data-testid="mobile-nav-posts"]').click();
      cy.url().should('include', '/posts');
      
      // Menu should close after navigation
      cy.get('[data-testid="mobile-menu"]').should('not.be.visible');
    });

    it('should close mobile menu when clicking outside', () => {
      cy.visit('/dashboard');
      
      // Open mobile menu
      cy.get('[data-testid="menu-toggle"]').click();
      cy.get('[data-testid="mobile-menu"]').should('be.visible');
      
      // Click outside menu
      cy.get('[data-testid="main-content"]').click();
      cy.get('[data-testid="mobile-menu"]').should('not.be.visible');
    });
  });

  describe('Breadcrumb Navigation', () => {
    it('should display correct breadcrumbs', () => {
      // Create a test post first
      cy.createPost({
        title: 'Breadcrumb Test Post',
        content: 'Testing breadcrumb navigation.',
        status: 'published'
      }).then((response) => {
        const postId = response.body._id;
        
        // Visit post page
        cy.visit(`/posts/${postId}`);
        
        // Check breadcrumbs
        cy.get('[data-testid="breadcrumb"]').should('be.visible');
        cy.get('[data-testid="breadcrumb-home"]').should('contain', 'Home');
        cy.get('[data-testid="breadcrumb-posts"]').should('contain', 'Posts');
        cy.get('[data-testid="breadcrumb-current"]').should('contain', 'Breadcrumb Test Post');
      });
    });

    it('should navigate using breadcrumb links', () => {
      cy.createPost({
        title: 'Navigation Test Post',
        content: 'Testing breadcrumb navigation.',
        status: 'published'
      }).then((response) => {
        const postId = response.body._id;
        
        cy.visit(`/posts/${postId}`);
        
        // Click on Posts breadcrumb
        cy.get('[data-testid="breadcrumb-posts"]').click();
        cy.url().should('include', '/posts');
        
        // Go back to post
        cy.visit(`/posts/${postId}`);
        
        // Click on Home breadcrumb
        cy.get('[data-testid="breadcrumb-home"]').click();
        cy.url().should('include', '/dashboard');
      });
    });
  });

  describe('Protected Routes', () => {
    it('should redirect unauthenticated users to login', () => {
      cy.logout();
      
      // Try to access protected route
      cy.visit('/dashboard');
      
      // Should redirect to login
      cy.url().should('not.include', '/dashboard');
      cy.get('[data-testid="login-form"]').should('be.visible');
    });

    it('should redirect authenticated users from auth pages', () => {
      // Already logged in, try to access login page
      cy.visit('/login');
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
    });

    it('should handle deep linking after authentication', () => {
      cy.logout();
      
      // Try to access deep link
      cy.visit('/posts/create');
      
      // Should redirect to login
      cy.get('[data-testid="login-form"]').should('be.visible');
      
      // Login
      cy.fillForm({
        email: 'nav@example.com',
        password: 'Password123'
      });
      cy.get('[data-testid="login-button"]').click();
      
      // Should redirect to originally requested page
      cy.url().should('include', '/posts/create');
    });
  });

  describe('Error Pages', () => {
    it('should display 404 page for non-existent routes', () => {
      cy.visit('/non-existent-page');
      
      cy.get('[data-testid="not-found"]').should('be.visible');
      cy.get('[data-testid="not-found-title"]').should('contain', '404');
      cy.get('[data-testid="back-home"]').should('be.visible');
    });

    it('should navigate back from 404 page', () => {
      cy.visit('/non-existent-page');
      
      // Click back to home
      cy.get('[data-testid="back-home"]').click();
      cy.url().should('include', '/dashboard');
    });

    it('should display 404 for non-existent posts', () => {
      const fakePostId = '507f1f77bcf86cd799439011';
      cy.visit(`/posts/${fakePostId}`);
      
      cy.get('[data-testid="post-not-found"]').should('be.visible');
      cy.get('[data-testid="back-to-posts"]').should('be.visible');
    });
  });

  describe('Search and Filtering', () => {
    beforeEach(() => {
      // Create test posts with different categories
      cy.createPost({
        title: 'JavaScript Tutorial',
        content: 'Learn JavaScript basics.',
        category: 'Technology',
        tags: ['javascript', 'tutorial']
      });
      
      cy.createPost({
        title: 'Cooking Recipe',
        content: 'How to make pasta.',
        category: 'Food',
        tags: ['cooking', 'recipe']
      });
    });

    it('should search posts globally', () => {
      cy.visit('/posts');
      
      // Use global search
      cy.get('[data-testid="global-search"]').type('JavaScript');
      cy.get('[data-testid="search-button"]').click();
      
      // Should show search results
      cy.get('[data-testid="search-results"]').should('be.visible');
      cy.get('[data-testid="post-item"]').should('contain', 'JavaScript Tutorial');
      cy.get('[data-testid="post-item"]').should('not.contain', 'Cooking Recipe');
    });

    it('should filter by category', () => {
      cy.visit('/posts');
      
      // Filter by Technology category
      cy.get('[data-testid="category-filter"]').select('Technology');
      
      // Should show only technology posts
      cy.get('[data-testid="post-item"]').should('contain', 'JavaScript Tutorial');
      cy.get('[data-testid="post-item"]').should('not.contain', 'Cooking Recipe');
    });

    it('should clear filters', () => {
      cy.visit('/posts');
      
      // Apply filter
      cy.get('[data-testid="category-filter"]').select('Technology');
      cy.get('[data-testid="post-item"]').should('have.length', 1);
      
      // Clear filters
      cy.get('[data-testid="clear-filters"]').click();
      
      // Should show all posts
      cy.get('[data-testid="post-item"]').should('have.length.at.least', 2);
    });
  });
});