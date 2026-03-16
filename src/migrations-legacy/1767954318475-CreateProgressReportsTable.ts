import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProgressReportsTable1767954318475 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Создаем таблицу progress_reports
    await queryRunner.query(`
            CREATE TABLE "progress_reports" (
                "id" SERIAL PRIMARY KEY,
                "date" TIMESTAMP NOT NULL,
                "weight" DECIMAL(5,2),
                "waist" DECIMAL(5,2),
                "hips" DECIMAL(5,2),
                "chest" DECIMAL(5,2),
                "arms" DECIMAL(5,2),
                "thighs" DECIMAL(5,2),
                "body_fat" DECIMAL(5,2),
                "muscle_mass" DECIMAL(5,2),
                "notes" TEXT,
                "photo_urls" TEXT[],
                "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                "client_id" INTEGER REFERENCES "clients"("id") ON DELETE CASCADE
            )
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем таблицу progress_reports
    await queryRunner.query(`DROP TABLE "progress_reports"`);
  }
}
