describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.cleanupTestData();
  });

  afterEach(() => {
    cy.cleanupTestData();
  });

  describe('User Registration', () => {
    it('should register a new user successfully', () => {
      // Navigate to registration form
      cy.get('[data-testid="switch-to-register"]').click();
      
      // Fill registration form
      cy.fillForm({
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'Password123'
      });
      
      // Submit form
      cy.get('[data-testid="register-button"]').click();
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome, newuser');
      
      // Should store token in localStorage
      cy.window().its('localStorage.token').should('exist');
    });

    it('should show validation errors for invalid data', () => {
      cy.get('[data-testid="switch-to-register"]').click();
      
      // Submit empty form
      cy.get('[data-testid="register-button"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="username-error"]').should('contain', 'Username is required');
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required');
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required');
    });

    it('should show error for duplicate email', () => {
      // First, register a user
      cy.register({
        username: 'firstuser',
        email: 'duplicate@example.com',
        password: 'Password123'
      });
      
      cy.logout();
      cy.visit('/');
      
      // Try to register with same email
      cy.get('[data-testid="switch-to-register"]').click();
      cy.fillForm({
        username: 'seconduser',
        email: 'duplicate@example.com',
        password: 'Password123'
      });
      
      cy.get('[data-testid="register-button"]').click();
      
      // Should show error message
      cy.get('[data-testid="error-message"]').should('contain', 'User already exists');
    });
  });

  describe('User Login', () => {
    beforeEach(() => {
      // Create a test user
      cy.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'Password123'
      });
      cy.logout();
      cy.visit('/');
    });

    it('should login successfully with correct credentials', () => {
      cy.fillForm({
        email: 'test@example.com',
        password: 'Password123'
      });
      
      cy.get('[data-testid="login-button"]').click();
      
      // Should redirect to dashboard
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome, testuser');
    });

    it('should show error for incorrect credentials', () => {
      cy.fillForm({
        email: 'test@example.com',
        password: 'WrongPassword'
      });
      
      cy.get('[data-testid="login-button"]').click();
      
      // Should show error message
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials');
      
      // Should remain on login page
      cy.url().should('not.include', '/dashboard');
    });

    it('should show validation errors for empty fields', () => {
      cy.get('[data-testid="login-button"]').click();
      
      cy.get('[data-testid="email-error"]').should('contain', 'Email is required');
      cy.get('[data-testid="password-error"]').should('contain', 'Password is required');
    });
  });

  describe('Authentication Persistence', () => {
    it('should persist login state after page refresh', () => {
      // Login
      cy.register({
        username: 'persistuser',
        email: 'persist@example.com',
        password: 'Password123'
      });
      
      // Verify logged in state
      cy.url().should('include', '/dashboard');
      
      // Refresh page
      cy.reload();
      
      // Should still be logged in
      cy.url().should('include', '/dashboard');
      cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome, persistuser');
    });

    it('should redirect to login when token is invalid', () => {
      // Set invalid token
      cy.window().then((win) => {
        win.localStorage.setItem('token', 'invalid-token');
      });
      
      cy.visit('/dashboard');
      
      // Should redirect to login
      cy.url().should('not.include', '/dashboard');
      cy.get('[data-testid="login-form"]').should('be.visible');
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      cy.register({
        username: 'logoutuser',
        email: 'logout@example.com',
        password: 'Password123'
      });
    });

    it('should logout successfully', () => {
      // Should be on dashboard
      cy.url().should('include', '/dashboard');
      
      // Click logout
      cy.get('[data-testid="logout-button"]').click();
      
      // Should redirect to login
      cy.url().should('not.include', '/dashboard');
      cy.get('[data-testid="login-form"]').should('be.visible');
      
      // Token should be removed
      cy.window().its('localStorage.token').should('not.exist');
    });
  });
});