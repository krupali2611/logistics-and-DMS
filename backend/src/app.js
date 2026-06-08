require('dotenv').config();
require('./models');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const customerAuthRoutes = require('./routes/customerAuthRoutes');
const userRoutes = require('./routes/userRoutes');
const driverRoutes = require('./routes/driverRoutes');
const documentRoutes = require('./routes/documentRoutes');
const vehicleTypeRoutes = require('./routes/vehicleTypeRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const vehicleDocumentRoutes = require('./routes/vehicleDocumentRoutes');
const customerRoutes = require('./routes/customerRoutes');
const customerAddressRoutes = require('./routes/customerAddressRoutes');
const customerDocumentRoutes = require('./routes/customerDocumentRoutes');
const customerNoteRoutes = require('./routes/customerNoteRoutes');
const customerProfileRoutes = require('./routes/customerProfileRoutes');
const customerShipmentRoutes = require('./routes/customerShipmentRoutes');
const customerPricingRoutes = require('./routes/customerPricingRoutes');
const shipmentRoutes = require('./routes/shipmentRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const packageRoutes = require('./routes/packageRoutes');
const attachmentRoutes = require('./routes/attachmentRoutes');
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
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use('/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) =>
  ApiResponse.success(res, 'Logistics DMS backend is healthy.', {
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/customer-auth', customerAuthRoutes);
app.use('/api/users', userRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/vehicle-types', vehicleTypeRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/vehicle-documents', vehicleDocumentRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/customer-addresses', customerAddressRoutes);
app.use('/api/customer-documents', customerDocumentRoutes);
app.use('/api/customer-notes', customerNoteRoutes);
app.use('/api/customer', customerProfileRoutes);
app.use('/api/customer/shipments', customerShipmentRoutes);
app.use('/api/customer/pricing', customerPricingRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/attachments', attachmentRoutes);

app.use((req, res) => ApiResponse.error(res, 'Route not found.', [], 404));
app.use(errorHandler);

module.exports = app;
