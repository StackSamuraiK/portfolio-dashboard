const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const YF = require('yahoo-finance2').default;
const yahooFinance = new YF({ suppressNotices: ['yahooSurvey'] });
const portfolioData = require('./data.json');

const app = express();
app.use(cors());
app.use(express.json());

// cache
let cachedPortfolio = [];
let lastFetchTime = 0;
const CACHE_TTL = 14000; // 15 sec

const formatNumber = (num) => isNaN(num) ? 'N/A' : Number(num).toFixed(2);

const scrapeGoogleFinance = async (ticker) => {
    try {
        const { data } = await axios.get(`https://www.google.com/finance/quote/${ticker}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        const $ = cheerio.load(data);

        let peRatio = 'N/A';
        let latestEarnings = 'N/A';

        try {
            const peText = $('div:contains("P/E ratio")').last().parent().next('.P6K39c').text();
            if (peText) peRatio = peText;
        } catch (e) { }

        try {
            const earningsText = $('.QXDnM').first().text();
            if (earningsText) latestEarnings = earningsText;
        } catch (e) { }

        return { peRatio, latestEarnings };
    } catch (err) {
        console.error(`Google Finance scrape failed for ${ticker}:`, err.message);
        return { peRatio: 'N/A', latestEarnings: 'N/A' };
    }
};

const getYahooData = async (ticker) => {
    try {
        const quote = await yahooFinance.quote(ticker);
        return quote?.regularMarketPrice || 'N/A';
    } catch (err) {
        console.error(`Yahoo Finance fetch failed for ${ticker}:`, err.message);
        return 'N/A';
    }
};

const fetchAllData = async () => {
    const promises = portfolioData.map(async (item) => {
        const [cmp, googleData] = await Promise.all([
            getYahooData(item.Ticker),
            scrapeGoogleFinance(item.GoogleFinanceTicker)
        ]);

        let presentValue = 'N/A';
        let gainLoss = 'N/A';

        if (cmp !== 'N/A') {
            presentValue = formatNumber(cmp * item.Qty);
            gainLoss = formatNumber((cmp * item.Qty) - item.Investment);
        }

        return {
            ...item,
            CMP: cmp !== 'N/A' ? formatNumber(cmp) : 'N/A',
            PresentValue: presentValue,
            GainLoss: gainLoss,
            PERatio: googleData.peRatio,
            LatestEarnings: googleData.latestEarnings
        };
    });

    return await Promise.all(promises);
};

app.get('/api/portfolio', async (req, res) => {
    try {
        const now = Date.now();
        if (cachedPortfolio.length > 0 && (now - lastFetchTime < CACHE_TTL)) {
            return res.json({ source: 'cache', data: cachedPortfolio });
        }

        const updatedPortfolio = await fetchAllData();
        cachedPortfolio = updatedPortfolio;
        lastFetchTime = now;

        res.json({ source: 'live', data: cachedPortfolio });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch portfolio data' });
    }
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
