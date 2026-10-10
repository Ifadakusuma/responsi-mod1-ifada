import express from "express";
import dotenv from "dotenv";
import memberRoutes from "./routes/memberRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";

dotenv.config();

const app = express();
app.use(express.json());

// Endpoint dasar untuk cek API hidup
app.get("/", (req, res) => {
  res.json({
    message: "Library Loan API is running",
    endpoints: ["/members", "/books", "/loans"],
  });
});

app.use("/members", memberRoutes);
app.use("/books", bookRoutes);
app.use("/loans", loanRoutes);

// Route tidak dikenal
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint tidak ditemukan" });
});

// Jalankan server hanya di lokal; di Vercel app diekspor sebagai handler
if (!process.env.VERCEL) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;