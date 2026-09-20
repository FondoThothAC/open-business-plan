import dotenv from 'dotenv';
import path from 'node:path';

// Execute before modules that read secrets at import time.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true });
dotenv.config({ quiet: true });
