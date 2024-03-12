import { context, describe, it, afterEach } from 'mocha'
import { Request, Response, NextFunction } from "express";
import sinon from 'sinon';
import { ExportTaskRepository } from "../lib/repository/exportTaskRepository";
import { ConstituentController } from "../lib/controllers/constituentController";
import { ExportTask, ExportTaskStatus } from "../lib/models/exportTask";
import { ConstituentRepository } from "../lib/repository/constituentRepository";
import ObjectsToCsv from "objects-to-csv";

describe('ConstituentController', () => {
    // stubs
    const taskRepoStub = sinon.createStubInstance(ExportTaskRepository);
    const constituentRepoStub = sinon.createStubInstance(ConstituentRepository);
    const objectCsvStub = sinon.createStubInstance(ObjectsToCsv);
    const controller = new ConstituentController(constituentRepoStub, taskRepoStub);

    afterEach(() => {
        sinon.reset();
    })

    describe('createExportTask', () => {
        describe('When same task definition has been created already and is complete', () => {
            const req = {
                params: {},
                query: {},
                protocol: 'http',
                hostname: 'localhost',
                headers: { host: 'localhost:8080' },
                baseUrl: '',
                originalUrl: '',
                body: {
                    startTimeMs: 0,
                    endTimeMs: 1
                }
            };
            const res = {} as Response;
            res.status = sinon.stub().returns(res);
            res.json = sinon.stub().returns(null);
            taskRepoStub.createTask.resolves();
            taskRepoStub.getTaskByFileId.resolves({ status: ExportTaskStatus.COMPLETE } as ExportTask);
            taskRepoStub.updateTaskStatus.resolves();

            it('current task is updated to be complete', async () => {
                await controller.createExportTask(req as Request, res as Response, {} as NextFunction);
                sinon.assert.calledOnce(taskRepoStub.updateTaskStatus);
            });
        });

        describe('When same task definition does not exist we kick off background job', () => {
            const req = {
                params: {},
                query: {},
                protocol: 'http',
                hostname: 'localhost',
                headers: { host: 'localhost:8080' },
                baseUrl: '',
                originalUrl: '',
                body: {
                    startTimeMs: 0,
                    endTimeMs: 1
                }
            };
            const res = {} as Response;
            res.status = sinon.stub().returns(res);
            res.json = sinon.stub().returns(null);
            taskRepoStub.createTask.resolves();
            taskRepoStub.getTaskByFileId.resolves(null);
            constituentRepoStub.listConstituentsBySignupTime.resolves([]);
            // @ts-ignore
            objectCsvStub.toDisk.returns();

            it('current task is updated to be complete', async () => {
                await controller.createExportTask(req as Request, res as Response, {} as NextFunction);
                sinon.assert.calledOnce(constituentRepoStub.listConstituentsBySignupTime);
            });
        });
    });
});
