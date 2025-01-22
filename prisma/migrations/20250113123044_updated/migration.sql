-- DropIndex
DROP INDEX "users_refresh_token_key";

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "refresh_token" DROP NOT NULL;
