const service = require("./service");

exports.getGames = async (req, res) => {

    try {

        const games = await service.getGames();

        res.json(games);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.getGame = async (req, res) => {

    try {

        const game = await service.getGame(req.params.id);

        if (!game)
            return res.status(404).json({
                message: "Game not found"
            });

        res.json(game);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.createGame = async (req, res) => {

    try {

        const game = await service.createGame(req.body);

        res.status(201).json(game);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.updateGame = async (req, res) => {

    try {

        const game = await service.updateGame(
            req.params.id,
            req.body
        );

        res.json(game);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.deleteGame = async (req, res) => {

    try {

        await service.deleteGame(req.params.id);

        res.json({
            success: true
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.featuredGames = async (req, res) => {

    try {

        const games = await service.getFeaturedGames();

        res.json(games);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};