const errorHandler = (err, req, res, next) => {
    console.error('Errore:', err);

    const status = err.status || 500;
    const message = err.message || "Errore del server";

    res.status(status).json({
        success: false,
        message,
    });
};

module.exports = errorHandler
