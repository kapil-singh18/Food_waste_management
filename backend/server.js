require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;
const DB_RETRY_MS = Number(process.env.DB_RETRY_MS || 10000);

const connectWithRetry = async () => {
  if (!process.env.MONGODB_URI) {
    console.error(`MONGODB_URI is missing. Retrying in ${DB_RETRY_MS}ms...`);
    setTimeout(connectWithRetry, DB_RETRY_MS);
    return;
  }

  try {
    await connectDB();
  } catch (error) {
    console.error(`Database connection failed: ${error.message}. Retrying in ${DB_RETRY_MS}ms...`);
    setTimeout(connectWithRetry, DB_RETRY_MS);
  }
};

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    connectWithRetry();
  });
};

startServer();
