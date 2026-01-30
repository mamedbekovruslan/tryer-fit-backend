import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateNutritionPlansTable1769800000002 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'nutrition_plans',
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
                    name: 'nutrition_category_id',
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
                    onUpdate: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);

        // Добавляем внешний ключ
        await queryRunner.createForeignKey('nutrition_plans', new TableForeignKey({
            columnNames: ['nutrition_category_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'nutrition_categories',
            onDelete: 'CASCADE',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('nutrition_plans');
    }

}