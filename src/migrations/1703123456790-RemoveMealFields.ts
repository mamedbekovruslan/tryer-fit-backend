import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class RemoveMealFields1703123456790 implements MigrationInterface {

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Удаление ненужных столбцов
    await queryRunner.dropColumns('meals', [
      'time',
      'calories',
      'protein',
      'fat',
      'carbohydrates'
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Восстановление столбцов при откате миграции
    await queryRunner.addColumns('meals', [
      new TableColumn({
        name: 'time',
        type: 'time',
        isNullable: true,
      }),
      new TableColumn({
        name: 'calories',
        type: 'integer',
        isNullable: true,
      }),
      new TableColumn({
        name: 'protein',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),
      new TableColumn({
        name: 'fat',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),
      new TableColumn({
        name: 'carbohydrates',
        type: 'decimal',
        precision: 5,
        scale: 2,
        isNullable: true,
      }),
    ]);
  }

}