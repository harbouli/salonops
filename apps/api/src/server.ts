import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';

const PORT = process.env.PORT || 4000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`[SalonOps API] Server listening on port http://localhost:${PORT}`);
  console.log(`[SalonOps API] Environment: ${process.env.NODE_ENV || 'development'}`);
});
