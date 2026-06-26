const Book = require("./model");

async function addReview(bookId, rating) {

    const book = await Book.findById(bookId);

    if (!book)
        throw new Error("Book not found");

    book.reviewCount += 1;

    book.rating =
        ((book.rating * (book.reviewCount - 1)) + rating)
        / book.reviewCount;

    await book.save();

    return book;
}

module.exports = {
    addReview
};