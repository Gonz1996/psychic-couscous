-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "productivityFactor" DOUBLE PRECISION NOT NULL DEFAULT 1.0;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "directorId" TEXT,
ADD COLUMN     "feeDesign" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "feeSupervision" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "overheadPct" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "riskReservePct" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "targetProfitPct" INTEGER NOT NULL DEFAULT 30;

-- CreateTable
CREATE TABLE "ProjectDiscipline" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "effortPct" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectDiscipline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectStaffing" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "disciplineId" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "effortPct" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectStaffing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProjectDiscipline_projectId_idx" ON "ProjectDiscipline"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectDiscipline_projectId_disciplineId_key" ON "ProjectDiscipline"("projectId", "disciplineId");

-- CreateIndex
CREATE INDEX "ProjectStaffing_projectId_idx" ON "ProjectStaffing"("projectId");

-- CreateIndex
CREATE INDEX "ProjectStaffing_employeeId_idx" ON "ProjectStaffing"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectStaffing_projectId_disciplineId_employeeId_key" ON "ProjectStaffing"("projectId", "disciplineId", "employeeId");

-- CreateIndex
CREATE INDEX "Project_directorId_idx" ON "Project"("directorId");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_directorId_fkey" FOREIGN KEY ("directorId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDiscipline" ADD CONSTRAINT "ProjectDiscipline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDiscipline" ADD CONSTRAINT "ProjectDiscipline_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectStaffing" ADD CONSTRAINT "ProjectStaffing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectStaffing" ADD CONSTRAINT "ProjectStaffing_disciplineId_fkey" FOREIGN KEY ("disciplineId") REFERENCES "Discipline"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectStaffing" ADD CONSTRAINT "ProjectStaffing_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
