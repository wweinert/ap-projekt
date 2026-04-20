const mongoose = require("mongoose");

module.exports = (req, _res, next) => {
    if (!req._id) req._id = new mongoose.Types.ObjectId();
    next();
};
