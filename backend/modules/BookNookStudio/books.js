const Book = require("./model");

async function getBooks() {
    return await Book.find().sort({ createdAt: -1 });
}

async function getBook(id) {
    return await Book.findById(id);
}

async function createBook(data) {
    return await Book.create(data);
}

async function updateBook(id, data) {
    return await Book.findByIdAndUpdate(id, data, {
        new: true
    });
}

async function deleteBook(id) {
    return await Book.findByIdAndDelete(id);
}

module.exports = {
    getBooks,
    getBook,
    createBook,
    updateBook,
    deleteBook
};