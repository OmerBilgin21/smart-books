import { MigrationInterface, QueryRunner } from 'typeorm';

export class IntroduceCreateAndUpdateTimers1756669671222
  implements MigrationInterface
{
  name = 'IntroduceCreateAndUpdateTimers1756669671222';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_records" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_records" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book_records" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "book_records" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "favorite_categories" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
  }
}
