import { createApp } from './lib/app';
import { config } from 'dotenv';
import { getDbPool } from "./lib/db";
import { ConstituentRepository } from "./lib/repository/constituentRepository";
import { ExportTaskRepository } from "./lib/repository/exportTaskRepository";
import { ConstituentController } from "./lib/controllers/constituentController";
import { logger } from "./lib/logger";

config()

const dbPool = getDbPool();
const constituentRepo = new ConstituentRepository(dbPool);
const exportTaskRepo = new ExportTaskRepository(dbPool);
const controller = new ConstituentController(constituentRepo, exportTaskRepo);

const app = createApp(controller);
const port = 8080;
app.listen(port, () => {
    logger.info(`Started app on port ${port}`);
});
process.on('SIGINT', async () => {
    await dbPool.end();
})
process.on('SIGTERM', async () => {
    await dbPool.end();
})
