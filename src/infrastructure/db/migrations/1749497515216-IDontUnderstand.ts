import { MigrationInterface, QueryRunner } from 'typeorm';

export class IDontUnderstand1749497515216 implements MigrationInterface {
  name = 'IDontUnderstand1749497515216';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "first_name" character varying NOT NULL, "last_name" character varying NOT NULL, "password" character varying NOT NULL, "suggestion_is_fresh" boolean NOT NULL DEFAULT false, "email" character varying NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "favorite_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "rank" integer NOT NULL, "user_id" uuid, CONSTRAINT "PK_698c12699d1697e8aa2c0a2b7bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."book_records_type_enum" AS ENUM('dislike', 'favorite', 'suggestion')`,
    );
    await queryRunner.query(
      `CREATE TABLE "book_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "self_link" character varying NOT NULL, "type" "public"."book_records_type_enum" NOT NULL DEFAULT 'favorite', "google_id" character varying NOT NULL, "user_id" uuid, CONSTRAINT "prevent_same_book_entry_for_same_type" UNIQUE ("self_link", "google_id", "type", "user_id"), CONSTRAINT "PK_1a8b66139b26686a3b3fbc99bdd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" ADD CONSTRAINT "FK_b5bfe58454360ee3245cd79de91" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_records" ADD CONSTRAINT "FK_6b031c65b51d3a743377b77b662" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book_records" DROP CONSTRAINT "FK_6b031c65b51d3a743377b77b662"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" DROP CONSTRAINT "FK_b5bfe58454360ee3245cd79de91"`,
    );
    await queryRunner.query(`DROP TABLE "book_records"`);
    await queryRunner.query(`DROP TYPE "public"."book_records_type_enum"`);
    await queryRunner.query(`DROP TABLE "favorite_categories"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
