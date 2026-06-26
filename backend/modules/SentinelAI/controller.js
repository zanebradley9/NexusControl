const service = require("./service");

exports.scan = async (req, res) => {

    try {

        const threats = await service.scanner.scan(req.body);

        if (threats.length) {

            await service.scanner.createAlert({

                title: "Threat Detected",

                message: threats.join(", "),

                severity: "High",

                source: req.ip,

                metadata: req.body

            });

        }

        res.json({

            threats

        });

    } catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};

exports.getAlerts = async (req, res) => {

    try {

        res.json(

            await service.monitor.getAlerts()

        );

    } catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};

exports.getAlert = async (req, res) => {

    try {

        const alert = await service.monitor.getAlert(

            req.params.id

        );

        if (!alert)

            return res.status(404).json({

                message: "Alert not found"

            });

        res.json(alert);

    } catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};

exports.resolveAlert = async (req, res) => {

    try {

        res.json(

            await service.monitor.resolveAlert(

                req.params.id

            )

        );

    } catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};

exports.deleteAlert = async (req, res) => {

    try {

        await service.monitor.deleteAlert(

            req.params.id

        );

        res.json({

            success: true

        });

    } catch (err) {

        res.status(500).json({

            message: err.message

        });

    }

};