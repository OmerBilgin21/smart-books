-- CreateTable
CREATE TABLE "dislikes" (
    "id" SERIAL NOT NULL,
    "self_link" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "dislikes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "dislikes" ADD CONSTRAINT "dislikes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
