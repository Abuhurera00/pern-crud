import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import helmet from 'helmet';
import morgan from 'morgan';
import productRouter from './routes/product.route.js';
import { sql } from './config/db.js';
import { aj } from './lib/arcjet.js';


const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(helmet());  // helemet is a security middleware that helps you protect  your app by setting various HTTP headers
app.use(morgan('dev')); // log the request

// apply arcjet rate-limit to all routes
app.use(async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {
            requested: 1  // specifies that each request consumes 1 token
        })

        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                res.status(429).json({ error: "Too Many Requests" })
            } else if (decision.reason.isBot()) {
                res.status(403).json({ error: "Bot Access Denied" })
            } else {
                res.status(403).json({ error: "Forbidden" })
            }
            return
        }

        // check for spoofed bots
        if (decision.results.some((result) => result.reason.isBot() && result.reason.isSpoofed())) {
            res.status(403).json({ error: "Spoofed bot detected" })
            return
        }

        next();
    } catch (error) {
        console.log("Arcjet Error", error);
        next(error)
    }
})


app.use("/api/products", productRouter);

async function initDB() {
    try {
        await sql`
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            image VARCHAR(255) NOT NULL,
            price DECIMAL(10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        `;

        console.log("Database connection initialized and table created.");
    } catch (error) {
        console.log("Error initializing database connection:", error);
    }
}


app.get('/', (req, res) => {
    res.send('Hello World! This is the postgresql backend server.');
});


initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    })
})