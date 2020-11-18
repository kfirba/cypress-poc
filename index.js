import http from 'http';
import fs from 'fs';
import puppeteer from 'puppeteer';

http.createServer(async (request, response) => {
  if (request.url.startsWith('/search')) {
    const param = decodeURIComponent(request.url.split('?')[1].split('=')[1]);
    const searchResult = await runPuppeteer(param);
    console.log(searchResult);

    response.writeHead(200, { 'content-Type': 'application/json' });
    response.end(JSON.stringify(searchResult), 'utf-8');

    return;
  }

  const filePath = request.url === '/' ? './index.html' : `.${request.url}`;
  const contentType = 'text/html';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.end('Error!', 'utf-8');

      return;
    }

    response.writeHead(200, { 'Content-Type': contentType });
    response.end(content, 'utf-8');
  });
}).listen(8888);
console.log('server running at localhost:8888');

async function runPuppeteer(term) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-web-security', '--disable-features=site-per-process'],
  });
  const page = (await browser.pages())[0];

  console.log('Launching puppeteer...');
  await page.goto('https://www.bing.com');

  console.log(`Searching for ${term}`);
  await page.type('#sb_form_q', term);
  await page.keyboard.press('Enter');

  try {
    await page.waitForSelector('#b_results');
    const response = await page.evaluate(() => {
      const el = document.querySelector('.b_algo');
      const titleLink = el.querySelector('h2 > a');

      return {
        status: 'success',
        title: titleLink.textContent,
        url: titleLink.getAttribute('href'),
        caption: el.querySelector('.b_caption p').textContent,
      };
    });

    await page.close();
    await browser.close();

    return response;
  } catch (e) {
    console.error(e);

    await page.close();
    await browser.close();

    return {
      status: 'error',
      message: e.message,
    };
  }
}
