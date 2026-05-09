/*
  Warnings:

  - Added the required column `index` to the `document_chunks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "document_chunks" ADD COLUMN     "index" INTEGER NOT NULL;
