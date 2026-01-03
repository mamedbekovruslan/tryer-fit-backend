import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameUsersToClients1766914533770 implements MigrationInterface {
    name = 'RenameUsersToClients1766914533770'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Переименовываем таблицу users в clients
        await queryRunner.query(`ALTER TABLE "users" RENAME TO "clients"`);

        // Переименовываем последовательность (если существует)
        await queryRunner.query(`ALTER SEQUENCE IF EXISTS "users_id_seq" RENAME TO "clients_id_seq"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Переименовываем обратно
        await queryRunner.query(`ALTER TABLE "clients" RENAME TO "users"`);
        await queryRunner.query(`ALTER SEQUENCE IF EXISTS "clients_id_seq" RENAME TO "users_id_seq"`);
    }

}
