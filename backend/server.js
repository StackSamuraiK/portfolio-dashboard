const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const YF = require('yahoo-finance2').default;
const yahooFinance = new YF({ suppressNotices: ['yahooSurvey'] });
const portfolioData = require('./data.json');
const NodeCache = require('node-cache');

const app = express();
app.use(cors());
app.use(express.json());

const portfolioCache = new NodeCache({ stdTTL: 0 });

const CACHE_KEY = 'portfolio_data';

const formatNumber = (num) => isNaN(num) ? 'N/A' : Number(num).toFixed(2);

const scrapeGoogleFinance = async (ticker) => {
    try {
        const { data } = await axios.get(`https://www.google.com/finance/quote/${ticker}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        const $ = cheerio.load(data);

        let peRatio = 'N/A';
        let latestEarnings = 'N/A';

        try {
            const peText = $('div:contains("P/E ratio")').last().parent().next().text();
            if (peText && peText !== '-') peRatio = peText;
        } catch (e) { }

        try {
            const revDiv = $('div:contains("Revenue")').last();
            if (revDiv.length) {
                const rawRowText = revDiv.parent().parent().text();
                const match = rawRowText.match(/([\d.,]+[A-Z]+)/i);
                if (match) latestEarnings = match[1];
                else latestEarnings = $('.QXDnM').first().text();
            }
            if (latestEarnings === '-' || !latestEarnings) latestEarnings = 'N/A';
        } catch (e) { }

        return { peRatio, latestEarnings };
    } catch (err) {
        console.error(`Google Finance scrape failed for ${ticker}:`, err.message);
        return { peRatio: 'N/A', latestEarnings: 'N/A' };
    }
};

const getYahooData = async (ticker) => {
    try {
        const quote = await Promise.race([
            yahooFinance.quote(ticker),
            new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 10s')), 10000))
        ]);
        return quote?.regularMarketPrice || 'N/A';
    } catch (err) {
        console.error(`Yahoo Finance fetch failed for ${ticker}:`, err.message);
        return 'N/A';
    }
};

const fetchAllData = async () => {
    const results = [];
    for (const item of portfolioData) {
        await new Promise(resolve => setTimeout(resolve, 500));
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

        results.push({
            ...item,
            CMP: cmp !== 'N/A' ? formatNumber(cmp) : 'N/A',
            PresentValue: presentValue,
            GainLoss: gainLoss,
            PERatio: googleData.peRatio,
            LatestEarnings: googleData.latestEarnings
        });
    }

    return results;
};

// Background worker
const startBackgroundWorker = async () => {
    console.log("Background worker started. Fetching initial data...");
    try {
        const data = await fetchAllData();
        portfolioCache.set(CACHE_KEY, data);
        console.log("Initial data fetch complete.");
    } catch (error) {
        console.error("Error in initial background fetch:", error.message);
    }

    setInterval(async () => {
        try {
            console.log("Background worker refreshing data...");
            const data = await fetchAllData();
            portfolioCache.set(CACHE_KEY, data);
        } catch (error) {
            console.error("Error in background fetch:", error.message);
        }
    }, 60000); // 60 sec
};

app.get('/api/portfolio', (req, res) => {
    const cachedData = portfolioCache.get(CACHE_KEY);

    if (cachedData) {
        return res.json({ source: 'cache', data: cachedData });
    }

    return res.status(202).json({
        message: 'Server is currently warming up and fetching initial data. Please try again shortly.',
        status: 'warming_up',
        data: portfolioData.map(item => ({
            ...item,
            CMP: 'N/A',
            PresentValue: 'N/A',
            GainLoss: 'N/A',
            PERatio: 'N/A',
            LatestEarnings: 'N/A'
        }))
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
    startBackgroundWorker();
});
