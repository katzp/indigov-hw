import { BaseRepository } from "./baseRepository";
import { Pool } from "pg";
import { ExportTask, ExportTaskStatus } from "../models/exportTask";

export class ExportTaskRepository extends BaseRepository<ExportTask>{
    constructor(dbPool: Pool) {
        super(dbPool);
    }

    async createTask(task: ExportTask): Promise<void> {
        const sql = `INSERT INTO export_tasks 
        ("id", "fileId", "startDate", "endDate", "params", "status", "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        `;
        await this.query(sql, [task.id, task.fileId, task.startDate, task.endDate, task.params, task.status.toString(), new Date()]);
    }

    async getTaskById(id: string): Promise<ExportTask | null> {
        const sql = 'SELECT * FROM export_tasks WHERE "id" = $1';
        const results = await this.query(sql, [id]);
        return results[0];
    }

    async getTaskByFileId(fileId: string): Promise<ExportTask | null> {
        const sql = 'SELECT * FROM export_tasks WHERE "fileId" = $1';
        const results = await this.query(sql, [fileId]);
        return results[0];
    }

    async updateTaskStatus(id: string, status: ExportTaskStatus): Promise<void> {
        const sql = 'UPDATE export_tasks SET "status" = $1 WHERE "id" = $2';
        await this.query(sql, [status, id]);
    }

    async updateAllTaskStatusWithFileId(fileId: string, status: ExportTaskStatus): Promise<void> {
        const sql = 'UPDATE export_tasks SET "status" = $1 WHERE "fileId" = $2';
        await this.query(sql, [status, fileId]);
    }
}
