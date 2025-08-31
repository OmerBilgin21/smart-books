import { MigrationInterface, QueryRunner } from 'typeorm';

export class IndexForBookRecords1756665344118 implements MigrationInterface {
  name = 'IndexForBookRecords1756665344118';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_6c35e57ee595519d12ffea80f2" ON "book_records" ("type") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_73c71a5a17fb5cf6fc773a7a22" ON "book_records" ("google_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_73c71a5a17fb5cf6fc773a7a22"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6c35e57ee595519d12ffea80f2"`,
    );
  }
}
