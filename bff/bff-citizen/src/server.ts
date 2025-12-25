import { initializeFirebase } from './config/firebase';
import { createApp } from './app';

const PORT = process.env.PORT || 3000;

// Initialize Firebase before creating the app
initializeFirebase();

const app = createApp();

app.listen(PORT, () => {
  console.log(`BFF Citizen server running on port ${PORT}`);
});
