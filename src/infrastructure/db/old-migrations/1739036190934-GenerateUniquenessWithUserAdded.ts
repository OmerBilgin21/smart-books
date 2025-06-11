import { MigrationInterface, QueryRunner } from 'typeorm';

export class GenerateUniquenessWithUserAdded1739036190934
  implements MigrationInterface
{
  name = 'GenerateUniquenessWithUserAdded1739036190934';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book_records" ADD CONSTRAINT "prevent_same_book_entry_for_same_type" UNIQUE ("self_link", "google_id", "type", "user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "book_records" DROP CONSTRAINT "prevent_same_book_entry_for_same_type"`,
    );
  }
}
