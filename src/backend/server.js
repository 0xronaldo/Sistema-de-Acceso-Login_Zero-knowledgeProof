require('dotenv').config();
const express = require('express');
const cors = require('cors');
const zkpRoutes = require('./routes/zkp');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/zkp', zkpRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ZKP Backend running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en puerto ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 ZKP API: http://localhost:${PORT}/api/zkp`);
});