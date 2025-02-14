-- CreateTable
CREATE TABLE "favorites" (
    "id" SERIAL NOT NULL,
    "self_link" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "usersId" INTEGER NOT NULL,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
