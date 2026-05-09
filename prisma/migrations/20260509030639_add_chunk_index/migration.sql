-- CreateEnum
CREATE TYPE "SummaryStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "summaries" ADD COLUMN     "status" "SummaryStatus" NOT NULL DEFAULT 'PROCESSING';
