import express from 'express';
import routes from './routes/routes';

const app = express();
const PORT = process.env.PORT || 3030;

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
