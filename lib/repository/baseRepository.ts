import { Pool, PoolClient } from "pg";
import { logger } from "../logger";

export class BaseRepository<T> {
    private pool: Pool;
    constructor(pool: Pool) {
        this.pool = pool;
    }

    async query(sql: string, bindVariables: any[], logSql = true): Promise<T[]> {
        let conn: PoolClient;
        try {
            conn = await this.pool.connect();
            if (logSql) {
                logger.info({ title: 'pg query', query: sql, bindVariables });
            }
            const result = await conn.query(sql, bindVariables);
            return result.rows as T[];
        } catch (error) {
            logger.error({ title: 'pg error', error });
            throw error;
        } finally {
            if (conn) {
                conn.release()
            }
        }
    }
}
