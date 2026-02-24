import { MigrationInterface, QueryRunner, Table, TableForeignKey, TableIndex } from 'typeorm';

export class CreateExercisesTable1770200000003 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'exercises',
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
                    name: 'sets',
                    type: 'integer',
                    isNullable: true,
                    comment: 'Количество подходов',
                },
                {
                    name: 'reps',
                    type: 'varchar',
                    length: '50',
                    isNullable: true,
                    comment: 'Количество повторений (может быть диапазоном, например "10-12")',
                },
                {
                    name: 'weight',
                    type: 'varchar',
                    length: '50',
                    isNullable: true,
                    comment: 'Вес (может быть диапазоном или "собственный вес")',
                },
                {
                    name: 'rest_time',
                    type: 'varchar',
                    length: '50',
                    isNullable: true,
                    comment: 'Время отдыха между подходами (например "60 сек")',
                },
                {
                    name: 'exercise_order',
                    type: 'integer',
                    isNullable: false,
                    default: 0,
                },
                {
                    name: 'workout_day_id',
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

        await queryRunner.createIndex('exercises', new TableIndex({
            name: 'IDX_EXERCISES_DAY',
            columnNames: ['workout_day_id'],
        }));

        await queryRunner.createForeignKey('exercises', new TableForeignKey({
            columnNames: ['workout_day_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'workout_days',
            onDelete: 'CASCADE',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable('exercises');
        const foreignKey = table?.foreignKeys.find(fk => fk.columnNames.includes('workout_day_id'));
        
        if (foreignKey) {
            await queryRunner.dropForeignKey('exercises', foreignKey);
        }
        
        await queryRunner.dropTable('exercises');
    }

}
