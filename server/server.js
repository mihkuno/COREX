
// express
import express from 'express';
import cors from 'cors';

// routes
import routes from './routes/routes.js';

// database
import Database from './lib/database.js';

// environment variables
import dotenv from 'dotenv';
dotenv.config();

// express app
const app = express();

// Add this line to enable JSON parsing
app.use(express.json());

// This is a proxy option for the dev server.
// Handles Cross-Origin Resource Sharing (CORS) errors.
app.use(cors());

// Set the routes of the API
routes(app);

// Connect to the database
Database.mongoose
    .connect(Database.url, {
        // useCreateIndex: true,
        // useFindAndModify: false,
    })
    .then(async () => {
        console.log("Connected to MongoDataBase");
        console.log(process.env.MONGOURL);
    })
    .catch((err) => {
        console.log(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
});

// Start the server
app.listen(process.env.EXPRESS_PORT, () => {
	console.log(`Server is running on port ${process.env.EXPRESS_PORT}`);
});
