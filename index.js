const connectDB = require('./config/db');
const app = require('./app');

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

startServer().catch(err => {
  console.error('Failed to start server', err);
  process.exit(1);
});
