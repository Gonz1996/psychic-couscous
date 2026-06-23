-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "inConception" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inSurveillance" BOOLEAN NOT NULL DEFAULT false;
