const Alert = require("./model");

async function getAlerts() {

    return await Alert.find().sort({
        createdAt: -1
    });

}

async function getAlert(id) {

    return await Alert.findById(id);

}

async function resolveAlert(id) {

    return await Alert.findByIdAndUpdate(
        id,
        {
            resolved: true
        },
        {
            new: true
        }
    );

}

async function deleteAlert(id) {

    return await Alert.findByIdAndDelete(id);

}

module.exports = {

    getAlerts,

    getAlert,

    resolveAlert,

    deleteAlert

};