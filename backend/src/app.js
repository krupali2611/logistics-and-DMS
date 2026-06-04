require('dotenv').config();
require('./models');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');
const ApiResponse = require('./utils/ApiResponse');

const app = express();

app.use(
  cors({
    origin: process.env.APP_ORIGIN?.split(',') || ['http://localhost:5173'],
    credentials: true
  })
);
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) =>
  ApiResponse.success(res, 'Logistics DMS backend is healthy.', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.use((req, res) => ApiResponse.error(res, 'Route not found.', [], 404));
app.use(errorHandler);

module.exports = app;
