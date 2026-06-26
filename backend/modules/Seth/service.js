const Conversation = require("./model");
const ai = require("./ai");

async function chat(message) {

    const result = await ai.chat(message);

    await Conversation.create({

        prompt: message,

        response: result.response,

        model: result.model

    });

    return result;

}

async function history() {

    return await Conversation.find()

        .sort({ createdAt: -1 });

}

module.exports = {

    chat,

    history

};