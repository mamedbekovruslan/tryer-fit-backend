import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class MakeNutritionCategoryIdNullable1770129110710 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Изменяем поле nutrition_category_id, чтобы оно могло быть NULL
    await queryRunner.changeColumn(
      'nutrition_days',
      'nutrition_category_id',
      new TableColumn({
        name: 'nutrition_category_id',
        type: 'integer',
        isNullable: true, // Теперь может быть NULL
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Возвращаем к предыдущему состоянию (NOT NULL)
    await queryRunner.changeColumn(
      'nutrition_days',
      'nutrition_category_id',
      new TableColumn({
        name: 'nutrition_category_id',
        type: 'integer',
        isNullable: false, // Было NOT NULL
      }),
    );
  }
}
