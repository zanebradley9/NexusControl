const service = require("./service");

exports.getAllBooks = async (req, res) => {

    try {

        const books = await service.books.getBooks();

        res.json(books);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.getBook = async (req, res) => {

    try {

        const book = await service.books.getBook(req.params.id);

        if (!book)
            return res.status(404).json({
                message: "Book not found"
            });

        res.json(book);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.createBook = async (req, res) => {

    try {

        const book = await service.books.createBook(req.body);

        res.status(201).json(book);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.updateBook = async (req, res) => {

    try {

        const book = await service.books.updateBook(
            req.params.id,
            req.body
        );

        res.json(book);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.deleteBook = async (req, res) => {

    try {

        await service.books.deleteBook(req.params.id);

        res.json({
            success: true
        });

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};

exports.reviewBook = async (req, res) => {

    try {

        const book = await service.reviews.addReview(
            req.params.id,
            req.body.rating
        );

        res.json(book);

    } catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};