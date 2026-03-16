import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTrainerIdToClients1767954318474 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add the trainer_id column to the clients table
    await queryRunner.query(`
            ALTER TABLE "clients"
            ADD COLUMN "trainer_id" integer REFERENCES "trainers"("id") ON DELETE SET NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the trainer_id column from the clients table
    await queryRunner.query(`
            ALTER TABLE "clients"
            DROP COLUMN "trainer_id"
        `);
  }
}
