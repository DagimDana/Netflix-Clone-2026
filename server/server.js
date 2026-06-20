import express from 'express';
import cors from 'cors';
import userRoutes, { ensureManagedUsersTable } from './userRoutes.js';
import videoRoutes, { ensureVideosTable } from './videoRoutes.js';
import { ensureDatabaseExists } from './db.js';

const app = express();
const port = globalThis.process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// 🔥 IMPORTANT LINE
app.use('/api', userRoutes);
app.use('/api', videoRoutes);

const startServer = async () => {
  try {
    await ensureDatabaseExists();
    await ensureManagedUsersTable();
    await ensureVideosTable();
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    globalThis.process.exit(1);
  }
};

startServer();