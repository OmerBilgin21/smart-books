-- CreateTable
CREATE TABLE "favorite_categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,

    CONSTRAINT "favorite_categories_pkey" PRIMARY KEY ("id")
);
