import { ConstituentRepository } from "../repository/constituentRepository";
import { NextFunction, Request, Response } from "express";
import { Constituent } from "../models/constituent";
import { ApiError } from "../api/apiError";
import { v4 as uuid } from 'uuid';
import { hashObject } from "../utils";
import { ExportTask, ExportTaskStatus } from "../models/exportTask";
import { ExportTaskRepository } from "../repository/exportTaskRepository";
import ObjectsToCsv from 'objects-to-csv';
import { logger } from '../logger';

export class ConstituentController {
    private constituentRepo: ConstituentRepository;
    private exportTaskRepo: ExportTaskRepository

    constructor(constituentRepo: ConstituentRepository, exportTaskRepo: ExportTaskRepository) {
        this.constituentRepo = constituentRepo;
        this.exportTaskRepo = exportTaskRepo;
    }

    async put(req: Request, res: Response, next: NextFunction) {
        const { email } = req.params;
        const constituent: Constituent = {
            email,
            firstName: req.body.firstName?.toLowerCase(),
            lastName: req.body.lastName?.toLowerCase(),
            signupDate: new Date(),
            city: req.body.city?.toLowerCase(),
            state: req.body.state?.toUpperCase(),
            zip: Number(req.body.zip),
            streetAddress: req.body.streetAddress?.toLowerCase()
        };
        const errors = this.validateConstituent(constituent);
        if (errors.length) {
            return next(ApiError.badRequest(errors.join(', ')))
        }
        try {
            await this.constituentRepo.putConstituent(constituent);
            return res.status(200).json(constituent);
        } catch (err) {
            return next(ApiError.internal(err.message))
        }
    }

    async get(req: Request, res: Response, next: NextFunction) {
        const limit = Number(req.query.limit) || 100;
        const offset = Number(req.query.offset) || 0;
        if (limit > 250) {
            return next(ApiError.badRequest('Max limit of 250'));
        }

        try {
            const constituents = await this.constituentRepo.listConstituents(limit, offset);
            const response = {
                results: constituents,
                pagination: {
                    // Normally would have additional info like totalCount
                    prev: offset === 0 ? null : `${req.path}?offset=${offset - limit}&limit=${limit}`,
                    next: `${req.path}?offset=${offset + limit}&limit=${limit}` // missing logic for if there is next page based on count
                }
            };
            return res.status(200).json(response);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    async createExportTask(req: Request, res: Response, next: NextFunction) {
        const { startTimeMs, endTimeMs, ...params } = req.body;
        const id = uuid();
        const fileId = hashObject(req.body);
        const task: ExportTask = {
            id,
            fileId,
            params,
            startDate: new Date(startTimeMs),
            endDate: new Date(endTimeMs),
            status: ExportTaskStatus.IN_PROGRESS
        };

        try {
            const [_, sameFileTaskExists] = await Promise.all([
                this.exportTaskRepo.createTask(task),
                this.exportTaskRepo.getTaskByFileId(task.fileId)
            ]);
            if (sameFileTaskExists && sameFileTaskExists.status !== ExportTaskStatus.FAILED) {
                if (sameFileTaskExists.status === ExportTaskStatus.COMPLETE) {
                    await this.exportTaskRepo.updateTaskStatus(task.id, ExportTaskStatus.COMPLETE);
                }
            } else {
                // kickoff job in background
                // ideally for background tasks we have a queue + workers to process queue message
                // and write file to S3 to separate the compute tasks from our request pipelines
                this.startExportTask(task);
            }

            return res.status(202).json({ id });
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    async getExportTaskStatus(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const task = await this.exportTaskRepo.getTaskById(id);
            if (!task) {
                return next(ApiError.notFound('Task not found'));
            }
            return res.status(200).json({ status: task.status });
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    async getExportTaskResults(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        try {
            const task = await this.exportTaskRepo.getTaskById(id);
            if (!task) {
                return next(ApiError.notFound('Task not found'));
            }
            if (task.status !== ExportTaskStatus.COMPLETE) {
                return next(ApiError.unprocessable(`Task in status ${task.status}`));
            }
            return res.status(200).sendFile(`${__dirname}/exports/${task.fileId}.csv`);
        } catch (err) {
            return next(ApiError.internal(err.message));
        }
    }

    // Normally I'd create an ExportService to separate logic from controllers given the time
    private async startExportTask(task: ExportTask): Promise<void> {
        try {
            const constituents = await this.constituentRepo.listConstituentsBySignupTime(task.startDate, task.endDate);
            const csvData = new ObjectsToCsv(constituents);
            await csvData.toDisk(`${__dirname}/exports/${task.fileId}.csv`);
            await this.exportTaskRepo.updateAllTaskStatusWithFileId(task.fileId, ExportTaskStatus.COMPLETE);
        } catch (error) {
            logger.error({ title: 'Error exporting to csv', task, error });
            await this.exportTaskRepo.updateAllTaskStatusWithFileId(task.fileId, ExportTaskStatus.FAILED);
        }
    }

    private validateConstituent(constituent: Constituent): string[] {
        const errors = [];

        const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (constituent.email !== '' && !constituent.email.match(emailFormat)) {
            errors.push('Invalid email');
        }

        // More validations like valid address ....
        return errors;
    }

}
