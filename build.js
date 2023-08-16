import * as fs from 'fs';
import { exec } from 'child_process';

try {
    fs.rmSync('dist', { recursive: true });
    console.log(`[Build]`, `Removed old build.`);
} catch (error) {
    console.warn(`[Build]`, `Failed to remove old build:`, error.message);
}

await new Promise((resolve, reject) => {
    exec('tsc', (error, stdout, stderr) => {
        if (error) {
            console.warn(`[Build]`, `Error while compiling TypeScript:`, error.message);
            resolve(error);
            return;
        }

        console.log(`[Build]`, `TypeScript compiled successfully.`);
        resolve();
    });
});

try {
    fs.copyFileSync('.env', 'dist/.env');
    console.log(`[Build]`, `Copied .env to the build.`);
} catch (error) {
    console.warn(`[Build]`, `Failed to copy .env to the build:`, error.message);
}