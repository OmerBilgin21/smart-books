import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveUniquenessConstraintForFix1739036134551 implements MigrationInterface {
    name = 'RemoveUniquenessConstraintForFix1739036134551'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_records" DROP CONSTRAINT "prevent_same_book_entry_for_same_type"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "book_records" ADD CONSTRAINT "prevent_same_book_entry_for_same_type" UNIQUE ("self_link", "type", "google_id")`);
    }

}
