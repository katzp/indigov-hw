import { Pool, PoolConfig } from 'pg';

export const getDbPool = () => {
    return new Pool({
        connectionString: process.env.DB_URL
    });
};
