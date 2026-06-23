-- CreateTable
CREATE TABLE "FirmFinance" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "periodLabel" TEXT NOT NULL DEFAULT 'Exercice en cours',
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "gstOwed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "qstOwed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sourceDeductionsOwed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "penaltiesOwed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "note" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FirmFinance_pkey" PRIMARY KEY ("id")
);
