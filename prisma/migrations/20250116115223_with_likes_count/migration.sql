/*
  Warnings:

  - Added the required column `date_updated` to the `lists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `likes_count` to the `lists` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `lists` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lists" ADD COLUMN     "date_updated" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "likes_count" INTEGER NOT NULL,
ADD COLUMN     "name" INTEGER NOT NULL;
