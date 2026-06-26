const Stock = require("./model");

async function getMarketSummary() {

    const stocks = await Stock.find();

    const totalStocks = stocks.length;

    const totalMarketCap = stocks.reduce(
        (sum, stock) => sum + stock.marketCap,
        0
    );

    const averagePrice =
        totalStocks === 0
            ? 0
            : stocks.reduce((sum, stock) => sum + stock.price, 0) /
              totalStocks;

    const gainers = stocks.filter(s => s.change > 0).length;

    const losers = stocks.filter(s => s.change < 0).length;

    return {
        totalStocks,
        totalMarketCap,
        averagePrice,
        gainers,
        losers
    };
}

module.exports = {
    getMarketSummary
};