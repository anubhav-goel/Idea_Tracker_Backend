const mongoose = require("mongoose");

const connectDb = async (settings) => {
    mongoose.set('debug', true);
    await mongoose.connect(settings.DB_MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
    console.log('MongoDB Connected...');
}

module.exports = connectDb;