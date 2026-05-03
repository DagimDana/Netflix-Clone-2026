import express from 'express';
import cors from 'cors';
import userRoutes from './userRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 IMPORTANT LINE
app.use('/api', userRoutes);

app.listen(5000, () => {
  console.log('Server running on port 5000');
});