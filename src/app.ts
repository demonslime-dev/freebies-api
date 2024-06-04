import { claimFromUnrealMarketplace } from '@/features/unrealmarketplace/unrealmarketplace.claimer.js';
import { getFreeAssetsFromUnrealMarketPlace } from '@/features/unrealmarketplace/unrealmarketplace.scraper.js';
import { claimTask } from '@/service.js';
import { createBrowserContext } from '@/shared/browser.js';
import prisma from '@/shared/database.js';
import logger from '@/shared/logger.js';
import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (_, res) => res.send('Server is up & running...'));

app.get('/example', async (_, res) => {
    const context = await createBrowserContext();

    try {
        const page = await context.newPage();
        await page.goto('https://example.com');
        const content = await page.content();
        await page.close();
        await context.close();
        res.send(content);
    } catch (e) { res.json(e); } finally { await context.close(); }
});

app.get('/test-claim', async (_, res) => {
    try {
        await claimTask();
        res.send('Done');
    } catch (e) { res.json(e); }
});

app.get('/test-unreal', async (_, res) => {
    const user = await prisma.user.findFirstOrThrow({ include: { productEntries: true } });
    const storageState = user.productEntries.find(item => item.productType === 'Unreal')?.storageState;
    const context = await createBrowserContext(storageState);

    try {
        const products = await getFreeAssetsFromUnrealMarketPlace();
        logger.info(products);

        for (const product of products) await claimFromUnrealMarketplace(product.url, context);
        await context.close();

        res.send('Done');
    } catch (e) { res.json(e); } finally { await context.close(); }
});

export default app;
