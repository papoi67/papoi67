import express from "express";
import prestamoRoutes from "./routes/prestamoRoutes.js";
import cors from "cors";

const app = express();

app.use(express.json());

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use("/prestamos", prestamoRoutes);
app.use("/api/prestamos", prestamoRoutes);


const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});