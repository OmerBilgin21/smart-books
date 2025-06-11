import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixEntityName1738969799524 implements MigrationInterface {
  name = 'FixEntityName1738969799524';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "favorite_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "rank" integer NOT NULL, "user_id" uuid, CONSTRAINT "PK_698c12699d1697e8aa2c0a2b7bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" ADD CONSTRAINT "FK_b5bfe58454360ee3245cd79de91" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" DROP CONSTRAINT "FK_b5bfe58454360ee3245cd79de91"`,
    );
    await queryRunner.query(`DROP TABLE "favorite_categories"`);
  }
}
