it('works with iframe', () => {
  cy.visit('/iframe.html').getIframe().within(() => {
    cy.get('#sb_form_q').type('cypress{enter}');
  });
});

it('triggers puppeteer', async () => {
  const response = await cy.visit('/puppeteer.html')
    .get('button')
    .click()
    .get('input')
    .should('not.have.value', undefined)
    .invoke('val')
    .then(async (word) => {
      return JSON.stringify(
        await (await fetch(`/search?q=${encodeURIComponent(word)}`)).json(),
        null,
        2,
      );
    })
    .promisify();

  cy.get('pre').then($pre => $pre.text(response));
});
