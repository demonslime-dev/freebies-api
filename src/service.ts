import { claimFromItchDotIo } from '@/features/itchdotio/itchdotio.claimer.js';
import { getFreeAssetsFromItchDotIo } from '@/features/itchdotio/itchdotio.scraper.js';
import { claimFromUnityAssetStore } from '@/features/unityassetstore/unityassetstore.claimer.js';
import { getFreeAssetsFromUnityAssetStore } from '@/features/unityassetstore/unityassetstore.scraper.js';
import { claimFromUnrealMarketplace } from '@/features/unrealmarketplace/unrealmarketplace.claimer.js';
import { getFreeAssetsFromUnrealMarketPlace } from '@/features/unrealmarketplace/unrealmarketplace.scraper.js';
import { sendMail } from '@/notifier.js';
import { createBrowserContext } from "@/shared/browser.js";
import prisma from '@/shared/database.js';
import logger from '@/shared/logger.js';
import { Prisma, ProductType } from '@prisma/client';
import { CronJob } from 'cron';
import { randomUUID } from 'crypto';
import { noTryAsync } from 'no-try';
import { BrowserContext } from 'playwright';

CronJob.from({ cronTime: '0 0,12 * * *', onTick: claimTask, start: true, timeZone: 'UTC' });

export async function claimTask() {
    const taskLogger = logger.child({ taskID: randomUUID() });
    taskLogger.info('Task started');

    taskLogger.info("Loading assets from itch.io");
    const [_, freeAssetsFromItchDotIo = []] = await noTryAsync(() => getFreeAssetsFromItchDotIo(), logError);

    taskLogger.info("Loading albums from itch.io");
    const [_1, freeAlbumsFromItchDotIo = []] = await noTryAsync(() => getFreeAssetsFromItchDotIo(), logError);

    taskLogger.info("Loading assets from unityassetstore");
    const [_2, freeAssetsFromUnityAssetStore = []] = await noTryAsync(() => getFreeAssetsFromUnityAssetStore(), logError);

    taskLogger.info("Loading assets from unrealmarketplace");
    const [_3, freeAssetsFromUnrealMarketplace = []] = await noTryAsync(() => getFreeAssetsFromUnrealMarketPlace(), logError);

    const products = [...freeAssetsFromItchDotIo, ...freeAssetsFromUnityAssetStore, ...freeAssetsFromUnrealMarketplace]
    taskLogger.info('Storing products data to database');
    for (const product of products) await noTryAsync(() => prisma.product.create({ data: product }), logError)

    const groupedProducts: Record<ProductType, Prisma.ProductCreateInput[]> = {
        [ProductType.Itch]: freeAssetsFromItchDotIo.concat(freeAlbumsFromItchDotIo),
        [ProductType.Unity]: freeAssetsFromUnityAssetStore,
        [ProductType.Unreal]: freeAssetsFromUnrealMarketplace
    }

    const users = await prisma.user.findMany({ include: { productEntries: true } });

    for (const user of users) {
        const userLogger = taskLogger.child({ userID: user.id });

        userLogger.info('Checking for auth sessions');
        for (const { productType, storageState } of user.productEntries) {
            const sessionLogger = userLogger.child({ productType })
            const context = await createBrowserContext(storageState);
            const assets = groupedProducts[productType];
            const claimer = getClaimer(productType);

            sessionLogger.info('Claiming products');
            for (const { url } of assets) {
                const [err] = await noTryAsync(() => claimer(url, context), logError);
                if (err) await noTryAsync(() => sendMail(user.email, "Claim failed", err.message), logError);
                else await noTryAsync(() => sendMail(user.email, "Claim success", "Product claimed Successfully"), logError);
            }
        }
    }

    taskLogger.info('Task ended');
}

type Claimer = (url: string, context: BrowserContext) => Promise<void>;

function getClaimer(productType: ProductType): Claimer {
    switch (productType) {
        case ProductType.Itch:
            return claimFromItchDotIo
        case ProductType.Unity:
            return claimFromUnityAssetStore
        case ProductType.Unreal:
            return claimFromUnrealMarketplace
    }
}

const groupBy = <T>(array: T[], predicate: (value: T, index: number, array: T[]) => string) =>
    array.reduce((acc, value, index, array) => {
        (acc[predicate(value, index, array)] ||= []).push(value);
        return acc;
    }, {} as { [key: string]: T[] });

function logError(error: Error) {
    logger.error(error, error.message);
}
