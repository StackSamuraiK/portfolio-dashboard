const axios = require('axios');
const cheerio = require('cheerio');
const data = require('./data.json');

const run = async () => {
  console.log('Testing a fast scraper against all stocks...');
  let fails = 0;
  for (const item of data) {
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const res = await axios.get('https://www.google.com/finance/quote/' + item.GoogleFinanceTicker, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
        timeout: 5000
      });
      const $ = cheerio.load(res.data);
      const peText = $('div:contains("P/E ratio")').last().parent().next().text();

      let earningsText = 'N/A';
      const revDiv = $('div:contains("Revenue")').last();
      if (revDiv.length) {
        const rawRowText = revDiv.parent().parent().text();
        const match = rawRowText.match(/([\d.,]+[A-Z]+)$/i);
        if (match) earningsText = match[1];
        else earningsText = $('.QXDnM').first().text(); // fallback
      }

      if (!peText || earningsText === 'N/A') {
        console.log(item.Ticker, 'MISSING METRICS', 'PE:', peText, 'Earn:', earningsText);
        fails++;
      } else {
        console.log(item.Ticker, 'SUCCESS', 'PE:', peText, 'Earn:', earningsText);
      }
    } catch (e) {
      console.log(item.Ticker, 'ERROR', e.message);
      fails++;
    }
  }
  console.log('Total Fails:', fails, '/', data.length);
}
run();
