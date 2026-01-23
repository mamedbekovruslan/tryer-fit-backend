import { MigrationInterface, QueryRunner } from "typeorm";

export class AddProgressFieldsToClient1767954318476 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Добавляем новые столбцы в таблицу clients
        await queryRunner.query(`
            ALTER TABLE "clients" 
            ADD COLUMN "weight" DECIMAL(5,2),
            ADD COLUMN "body_fat" DECIMAL(5,2),
            ADD COLUMN "muscle_mass" DECIMAL(5,2)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем столбцы из таблицы clients
        await queryRunner.query(`
            ALTER TABLE "clients" 
            DROP COLUMN "weight",
            DROP COLUMN "body_fat", 
            DROP COLUMN "muscle_mass"
        `);
    }

}