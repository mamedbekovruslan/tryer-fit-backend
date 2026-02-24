import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateClientWorkoutProgramsTable1770200000004 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'client_workout_programs',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'client_id',
                    type: 'integer',
                    isNullable: false,
                },
                {
                    name: 'workout_program_id',
                    type: 'integer',
                    isNullable: false,
                },
                {
                    name: 'is_active',
                    type: 'boolean',
                    default: false,
                },
                {
                    name: 'assigned_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);

        await queryRunner.createIndex('client_workout_programs', new TableIndex({
            name: 'IDX_CLIENT_WORKOUT_PROGRAMS_CLIENT',
            columnNames: ['client_id'],
        }));

        await queryRunner.createIndex('client_workout_programs', new TableIndex({
            name: 'IDX_CLIENT_WORKOUT_PROGRAMS_PROGRAM',
            columnNames: ['workout_program_id'],
        }));

        await queryRunner.createIndex('client_workout_programs', new TableIndex({
            name: 'IDX_CLIENT_WORKOUT_PROGRAMS_ACTIVE',
            columnNames: ['is_active'],
        }));

        await queryRunner.createForeignKey('client_workout_programs', new TableForeignKey({
            columnNames: ['client_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'clients',
            onDelete: 'CASCADE',
        }));

        await queryRunner.createForeignKey('client_workout_programs', new TableForeignKey({
            columnNames: ['workout_program_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'workout_programs',
            onDelete: 'CASCADE',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('client_workout_programs');
        const clientForeignKey = table?.foreignKeys.find(fk => fk.columnNames.includes('client_id'));
        const programForeignKey = table?.foreignKeys.find(fk => fk.columnNames.includes('workout_program_id'));
        
        if (clientForeignKey) {
            await queryRunner.dropForeignKey('client_workout_programs', clientForeignKey);
        }
        if (programForeignKey) {
            await queryRunner.dropForeignKey('client_workout_programs', programForeignKey);
        }
        
        await queryRunner.dropTable('client_workout_programs');
    }

}
