const app = require('./app');
const { env } = require('./config/env');
const connectingToDatabase = require('./database/db_connection');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectingToDatabase();
        app.listen(env.PORT, () => {
            console.log(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

startServer();