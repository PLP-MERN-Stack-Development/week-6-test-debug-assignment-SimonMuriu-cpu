// Custom commands for authentication
Cypress.Commands.add('login', (email = 'test@example.com', password = 'Password123') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/login`,
    body: {
      email,
      password
    }
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('token');
  window.localStorage.removeItem('user');
});

Cypress.Commands.add('register', (userData) => {
  const defaultUserData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'Password123'
  };
  
  const user = { ...defaultUserData, ...userData };
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/register`,
    body: user
  }).then((response) => {
    window.localStorage.setItem('token', response.body.token);
    window.localStorage.setItem('user', JSON.stringify(response.body.user));
  });
});

// Custom command to create a test post
Cypress.Commands.add('createPost', (postData) => {
  const token = window.localStorage.getItem('token');
  
  const defaultPostData = {
    title: 'Test Post',
    content: 'This is a test post content',
    category: '507f1f77bcf86cd799439011'
  };
  
  const post = { ...defaultPostData, ...postData };
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/posts`,
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: post
  });
});

// Custom command to wait for element and check visibility
Cypress.Commands.add('waitForElement', (selector, timeout = 10000) => {
  cy.get(selector, { timeout }).should('be.visible');
});

// Custom command to fill form fields
Cypress.Commands.add('fillForm', (formData) => {
  Object.keys(formData).forEach(field => {
    cy.get(`[name="${field}"]`).clear().type(formData[field]);
  });
});