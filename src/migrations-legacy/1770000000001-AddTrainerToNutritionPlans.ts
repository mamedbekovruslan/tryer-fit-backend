import {
  MigrationInterface,
  QueryRunner,
  TableColumn,
  TableForeignKey,
} from 'typeorm';

export class AddTrainerToNutritionPlans1770000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Добавляем колонку trainer_id
    await queryRunner.addColumn(
      'nutrition_plans',
      new TableColumn({
        name: 'trainer_id',
        type: 'integer',
        isNullable: true, // Сначала nullable, чтобы не нарушить существующие записи
      }),
    );

    // Создаем внешний ключ
    await queryRunner.createForeignKey(
      'nutrition_plans',
      new TableForeignKey({
        columnNames: ['trainer_id'],
        referencedColumnNames: ['id'],
        referencedTableName: 'trainers',
        onDelete: 'SET NULL', // При удалении тренера, планы остаются, но без связи
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Удаляем внешний ключ
    const table = await queryRunner.getTable('nutrition_plans');
    const foreignKey = table!.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('trainer_id') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('nutrition_plans', foreignKey);
    }

    // Удаляем колонку
    await queryRunner.dropColumn('nutrition_plans', 'trainer_id');
  }
}
