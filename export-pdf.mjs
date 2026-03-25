import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({
  headless: true,
  executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});

for (const name of ['cv', 'cover-letter']) {
  const page = await browser.newPage();
  await page.goto(`file://${path.join(__dirname, name + '.html')}`, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: path.join(__dirname, name + '.pdf'),
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: false,
    margin: { top: '0', bottom: '0', left: '0', right: '0' },
  });
  await page.close();
  console.log(`${name}.pdf exported`);
}

await browser.close();
