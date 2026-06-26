const Stock = require("./model");

async function getStocks() {
    return await Stock.find().sort({ symbol: 1 });
}

async function getStock(id) {
    return await Stock.findById(id);
}

async function createStock(data) {
    return await Stock.create(data);
}

async function updateStock(id, data) {
    return await Stock.findByIdAndUpdate(id, data, {
        new: true
    });
}

async function deleteStock(id) {
    return await Stock.findByIdAndDelete(id);
}

module.exports = {
    getStocks,
    getStock,
    createStock,
    updateStock,
    deleteStock
};