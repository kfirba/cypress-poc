Cypress.Commands.add('getIframe', () => {
  return cy
    .get('iframe')
    .its('0.contentDocument.body', { log: false })
    .should('not.be.empty')
    .then((body) => {
      cy.wrap(body, { log: false });
    });
});
