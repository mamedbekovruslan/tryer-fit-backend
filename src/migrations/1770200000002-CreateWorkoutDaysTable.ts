import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateWorkoutDaysTable1770200000002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'workout_days',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'name',
                    type: 'varchar',
                    length: '100',
                    isNullable: false,
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'day_order',
                    type: 'integer',
                    isNullable: false,
                    default: 0,
                },
                {
                    name: 'workout_program_id',
                    type: 'integer',
                    isNullable: false,
                },
                {
                    name: 'created_at',
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

        await queryRunner.createIndex('workout_days', new TableIndex({
            name: 'IDX_WORKOUT_DAYS_PROGRAM',
            columnNames: ['workout_program_id'],
        }));

        await queryRunner.createForeignKey('workout_days', new TableForeignKey({
            columnNames: ['workout_program_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'workout_programs',
            onDelete: 'CASCADE',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('workout_days');
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.includes('workout_program_id'));
        
        if (foreignKey) {
            await queryRunner.dropForeignKey('workout_days', foreignKey);
        }
        
        await queryRunner.dropTable('workout_days');
    }

}
