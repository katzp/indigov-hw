import { Pool } from "pg";
import { BaseRepository } from "./baseRepository";
import { Constituent } from "../models/constituent";

export class ConstituentRepository extends BaseRepository<Constituent> {
    constructor(dbPool: Pool) {
        super(dbPool);
    }

    async listConstituentsBySignupTime(startTime: Date, endTime: Date): Promise<Constituent[]> {
        const sql = 'SELECT * FROM constituents WHERE "signupDate" >= $1 AND "signupDate" <= $2';
        return await this.query(sql, [startTime, endTime]);
    }

    async listConstituents(limit: number, offset: number): Promise<Constituent[]> {
        const sql = `SELECT * FROM constituents LIMIT ${limit} OFFSET ${offset}`;
        return await this.query(sql, []);
    }

    async putConstituent(constituent: Constituent): Promise<void> {
        const now = new Date();
        const sql = `INSERT INTO constituents
        ("email", "firstName", "lastName", "streetAddress", "city", "state", "zip", "signupDate", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT(email)
        DO UPDATE SET 
        "firstName" = EXCLUDED."firstName", "lastName" = EXCLUDED."lastName", "streetAddress" = EXCLUDED."streetAddress",
         "city" = EXCLUDED."city", "state" = EXCLUDED."state", "zip" = EXCLUDED."zip", "updatedAt" = EXCLUDED."updatedAt";
        `
        await this.query(sql, [
            constituent.email,
            constituent.firstName,
            constituent.lastName,
            constituent.streetAddress,
            constituent.city,
            constituent.state,
            constituent.zip,
            constituent.signupDate,
            now,
            now
        ]);
    }
}
