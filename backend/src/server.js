require('dotenv').config();

const app = require('./app');
const db = require('./models');

const PORT = Number(process.env.PORT || 5000);

const startServer = async () => {
  try {
    await db.sequelize.authenticate();
    console.log('Supabase PostgreSQL connection established successfully.');

    app.listen(PORT, () => {
      console.log(`Backend server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error('Unable to connect to Supabase PostgreSQL or start the server:', error);
    process.exit(1);
  }
};

startServer();
