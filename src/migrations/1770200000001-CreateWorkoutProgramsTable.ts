import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateWorkoutProgramsTable1770200000001 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'workout_programs',
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
                    name: 'workout_category_id',
                    type: 'integer',
                    isNullable: false,
                },
                {
                    name: 'trainer_id',
                    type: 'integer',
                    isNullable: true,
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

        await queryRunner.createForeignKey('workout_programs', new TableForeignKey({
            columnNames: ['workout_category_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'workout_categories',
            onDelete: 'CASCADE',
        }));

        await queryRunner.createForeignKey('workout_programs', new TableForeignKey({
            columnNames: ['trainer_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'trainers',
            onDelete: 'SET NULL',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('workout_programs');
        const categoryForeignKey = table?.foreignKeys.find(fk => fk.columnNames.includes('workout_category_id'));
        const trainerForeignKey = table?.foreignKeys.find(fk => fk.columnNames.includes('trainer_id'));
        
        if (categoryForeignKey) {
            await queryRunner.dropForeignKey('workout_programs', categoryForeignKey);
        }
        if (trainerForeignKey) {
            await queryRunner.dropForeignKey('workout_programs', trainerForeignKey);
        }
        
        await queryRunner.dropTable('workout_programs');
    }

}
