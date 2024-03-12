import express, { Express } from 'express';
import { loggingHandler } from "./middleware/loggingHandler";
import { errorHandler } from "./middleware/errorHandler";
import { ConstituentController } from "./controllers/constituentController";

export const createApp = (constituentController: ConstituentController) => {
    const app: Express = express();
    app.use(express.json());
    app.use(express.text());
    app.use(express.urlencoded({ extended: false }));

    app.use(loggingHandler);

    const router = express.Router();
    router.put('/constituents/:email', (req, res, next) => constituentController.put(req, res, next));
    router.get('/constituents', (req, res, next) => constituentController.get(req, res, next));
    router.post('/constituents/exportTasks', (req, res, next) => constituentController.createExportTask(req, res, next));
    router.get('/constituents/exportTasks/:id/status', (req, res, next) => constituentController.getExportTaskStatus(req, res, next));
    router.get('/constituents/exportTasks/:id', (req, res, next) => constituentController.getExportTaskResults(req, res, next));

    app.use('/v0', router);

    app.use(errorHandler);
    return app;
}
