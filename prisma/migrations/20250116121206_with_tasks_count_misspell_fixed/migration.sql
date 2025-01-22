/*
  Warnings:

  - You are about to drop the column `likes_count` on the `lists` table. All the data in the column will be lost.
  - Added the required column `tasks_count` to the `lists` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lists" DROP COLUMN "likes_count",
ADD COLUMN     "tasks_count" INTEGER NOT NULL;
