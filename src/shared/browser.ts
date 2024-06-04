import { BrowserContext, firefox } from 'playwright';

const browser = await firefox.launch({ headless: true });

export const createBrowserContext = async (storageState?: PrismaJson.StorageState) => {
    const context = await browser.newContext({ storageState });
    context.setDefaultNavigationTimeout(10 * 60 * 1000);
    return context;
}

export const closeAllBrowserContexts = async () => {
    for (const context of browser.contexts()) await context.close();
};

export const closeAllPagesFromContext = async (context: BrowserContext) => {
    for (const page of context.pages()) await page.close();
};
