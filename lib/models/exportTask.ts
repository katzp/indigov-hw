export enum ExportTaskStatus {
    IN_PROGRESS = 'started',
    COMPLETE = 'complete',
    FAILED = 'failed'
}

export interface ExportTask {
    id: string,
    fileId: string,
    startDate: Date,
    endDate: Date,
    params: Object,
    status: ExportTaskStatus
}
