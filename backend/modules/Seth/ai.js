const prompts = require("./prompts");

async function chat(message) {

    return {
        model: "seth-v1",
        prompt: message,
        response:
            "Seth AI received your message: " +
            message,
        system: prompts.system
    };

}

module.exports = {

    chat

};