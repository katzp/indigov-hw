CREATE TABLE constituents (
    "email" TEXT PRIMARY KEY,
    "signupDate" TIMESTAMP,
    "firstName" TEXT,
    "lastName" TEXT,
    "streetAddress" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" INTEGER,
    "createdAt" TIMESTAMP,
    "updatedAt" TIMESTAMP
);

CREATE TABLE export_tasks (
    "id" TEXT PRIMARY KEY,
    "fileId" TEXT,
    "startDate" TIMESTAMP,
    "endDate" TIMESTAMP,
    "params" JSONB,
    "status" TEXT,
    "createdAt" TIMESTAMP
);
