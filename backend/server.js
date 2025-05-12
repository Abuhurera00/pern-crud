import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import helmet from 'helmet';
import morgan from 'morgan';
import productRouter from './routes/product.route.js';
import { sql } from './config/db.js';


const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));


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