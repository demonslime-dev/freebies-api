import { createBrowserContext } from '@/shared/browser.js';
import logger from '@/shared/logger.js';

export async function loginToUnityAssetStore(email: string, password: string): Promise<PrismaJson.StorageState> {
    const context = await createBrowserContext();
    try {
        const page = await context.newPage();
        logger.info('Navigating to login page');
        await page.goto('https://id.unity.com/en');
        logger.info('Filling login credentials');
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password').fill(password);
        logger.info('Logging in');
        await page.click('input[type=submit]');
        logger.info('Waiting fro redirect after logging in');
        await page.waitForURL('https://id.unity.com/en/account/edit');
        logger.info('Logged in successfully');
        return await context.storageState();
    } finally { await context.close(); }
}
