import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddNutritionPlanIdToNutritionDays1770128821654 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Добавляем колонку nutrition_plan_id
        await queryRunner.addColumn('nutrition_days', new TableColumn({
            name: 'nutrition_plan_id',
            type: 'integer',
            isNullable: true, // Сначала nullable, чтобы не нарушить существующие записи
        }));

        // Создаем внешний ключ
        await queryRunner.createForeignKey('nutrition_days', new TableForeignKey({
            columnNames: ['nutrition_plan_id'],
            referencedColumnNames: ['id'],
            referencedTableName: 'nutrition_plans',
            onDelete: 'CASCADE', // При удалении плана дни питания также удалятся
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Удаляем внешний ключ
        const table = await queryRunner.getTable('nutrition_days');
        const foreignKey = table!.foreignKeys.find(fk => fk.columnNames.indexOf('nutrition_plan_id') !== -1);
        if (foreignKey) {
            await queryRunner.dropForeignKey('nutrition_days', foreignKey);
        }

        // Удаляем колонку
        await queryRunner.dropColumn('nutrition_days', 'nutrition_plan_id');
    }

}
