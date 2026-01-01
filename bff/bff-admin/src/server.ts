import { initializeFirebase } from './config/firebase';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();
import { createApp } from './app';

const PORT = process.env.PORT || 3001;

// Initialize Firebase before creating the app
initializeFirebase();

const app = createApp();

app.listen(PORT, () => {
  console.log(`BFF Admin server running on port ${PORT}`);
});
