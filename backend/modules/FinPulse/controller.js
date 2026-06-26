const service = require("./service");

exports.getStocks = async (req, res) => {

    try {

        res.json(await service.stocks.getStocks());

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.getStock = async (req, res) => {

    try {

        const stock = await service.stocks.getStock(req.params.id);

        if (!stock)
            return res.status(404).json({
                message: "Stock not found"
            });

        res.json(stock);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.createStock = async (req, res) => {

    try {

        res.status(201).json(
            await service.stocks.createStock(req.body)
        );

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.updateStock = async (req, res) => {

    try {

        res.json(
            await service.stocks.updateStock(
                req.params.id,
                req.body
            )
        );

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.deleteStock = async (req, res) => {

    try {

        await service.stocks.deleteStock(req.params.id);

        res.json({
            success: true
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.analytics = async (req, res) => {

    try {

        res.json(
            await service.analytics.getMarketSummary()
        );

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};