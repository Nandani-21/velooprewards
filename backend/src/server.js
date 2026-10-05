import { app } from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

connectDatabase().then(() => app.listen(env.port, () => console.log(`VELoop API listening on ${env.port}`))).catch(error => { console.error(error); process.exit(1); });
