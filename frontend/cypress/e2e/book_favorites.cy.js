describe('Book Favorites App', () => {
  // generate a random username and password for the e2e tests
  const username = `e2euser${Math.floor(Math.random() * 1000)}`;
  const password = `e2epass${Math.floor(Math.random() * 1000)}`;
  const user = { username, password };

  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should allow a new user to register and login', () => {
    cy.contains('Create Account').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#register').click();
    cy.contains('Registration successful! You can now log in.').should('exist');
    // wait for a bit to ensure the success message is visible
    cy.wait(2000);
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains(`Hi, ${user.username}`).should('exist');
    cy.contains('Favorites').should('exist');
  });

  it('should show books and allow adding to favorites', () => {
    // Login first
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains('Books').click();
    cy.contains('h2', 'Books').should('exist');
    cy.get('button').contains('Add to Favorites').first().click();
    cy.get('a#favorites-link').click();
    cy.get('h2').contains('My Favorite Books').should('exist');
  });

  it('should logout and protect routes', () => {
    // Login first
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.get('button#logout').click();
    cy.contains('Login').should('exist');
    cy.visit('http://localhost:5173/books');
    cy.url().should('eq', 'http://localhost:5173/');
  });

  // generated-by-copilot: Test clear all favorites functionality
  it('should clear all favorites with confirmation', () => {
    // Login first
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    
    // Go to favorites to check current state
    cy.get('a#favorites-link').click();
    
    // If no favorites exist, add some first
    cy.get('body').then(($body) => {
      if ($body.text().includes('No favorite books yet')) {
        // Add a couple of books to favorites
        cy.contains('Books').click();
        cy.get('button').contains('Add to Favorites').first().click();
        cy.wait(500);
        cy.get('button').contains('Add to Favorites').eq(1).click();
        cy.wait(500);
        
        // Go back to favorites
        cy.get('a#favorites-link').click();
      }
    });
    
    cy.get('h2').contains('My Favorite Books').should('exist');
    
    // Verify we have favorites
    cy.get('ul li').should('have.length.at.least', 1);
    
    // Click Clear All button - stub the confirm dialog to accept
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(true);
    });
    cy.get('button#clear-all-favorites').click();
    
    // Verify favorites are cleared
    cy.contains('No favorite books yet.').should('exist');
  });

  it('should not clear favorites when confirmation is cancelled', () => {
    // Login first
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    
    // Go to favorites to check current state
    cy.get('a#favorites-link').click();
    
    // If no favorites exist, add one first
    cy.get('body').then(($body) => {
      if ($body.text().includes('No favorite books yet')) {
        // Add a book to favorites
        cy.contains('Books').click();
        cy.get('button').contains('Add to Favorites').first().click();
        cy.wait(500);
        
        // Go back to favorites
        cy.get('a#favorites-link').click();
      }
    });
    
    // Click Clear All but cancel the confirmation
    cy.window().then((win) => {
      cy.stub(win, 'confirm').returns(false);
    });
    cy.get('button#clear-all-favorites').click();
    
    // Verify favorites are still there
    cy.get('ul li').should('have.length.at.least', 1);
  });
});
