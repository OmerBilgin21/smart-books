import { MigrationInterface, QueryRunner } from 'typeorm';

export class EmailIndexForUser1756665240777 implements MigrationInterface {
  name = 'EmailIndexForUser1756665240777';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`,
    );
  }
}
