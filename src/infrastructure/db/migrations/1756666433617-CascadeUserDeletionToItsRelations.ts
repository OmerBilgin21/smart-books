import { MigrationInterface, QueryRunner } from 'typeorm';

export class CascadeUserDeletionToItsRelations1756666433617
  implements MigrationInterface
{
  name = 'CascadeUserDeletionToItsRelations1756666433617';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" DROP CONSTRAINT "FK_b5bfe58454360ee3245cd79de91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_records" DROP CONSTRAINT "FK_6b031c65b51d3a743377b77b662"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" ALTER COLUMN "user_id" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" ADD CONSTRAINT "FK_b5bfe58454360ee3245cd79de91" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_records" ADD CONSTRAINT "FK_6b031c65b51d3a743377b77b662" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book_records" DROP CONSTRAINT "FK_6b031c65b51d3a743377b77b662"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" DROP CONSTRAINT "FK_b5bfe58454360ee3245cd79de91"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" ALTER COLUMN "user_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_records" ADD CONSTRAINT "FK_6b031c65b51d3a743377b77b662" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" ADD CONSTRAINT "FK_b5bfe58454360ee3245cd79de91" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
