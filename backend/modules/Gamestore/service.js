const Game = require("./model");

async function getGames() {
    return await Game.find().sort({ createdAt: -1 });
}

async function getGame(id) {
    return await Game.findById(id);
}

async function createGame(data) {
    return await Game.create(data);
}

async function updateGame(id, data) {
    return await Game.findByIdAndUpdate(
        id,
        data,
        { new: true }
    );
}

async function deleteGame(id) {
    return await Game.findByIdAndDelete(id);
}

async function getFeaturedGames() {
    return await Game.find({ featured: true });
}

module.exports = {

    getGames,

    getGame,

    createGame,

    updateGame,

    deleteGame,

    getFeaturedGames

};