-- CreateTable
CREATE TABLE "suggestions" (
    "id" SERIAL NOT NULL,
    "self_link" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
