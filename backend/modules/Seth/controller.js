const service = require("./service");

exports.chat = async (req, res) => {

    try {

        const result = await service.chat(
            req.body.message
        );

        res.json(result);

    } catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};

exports.history = async (req, res) => {

    try {

        res.json(

            await service.history()

        );

    } catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};