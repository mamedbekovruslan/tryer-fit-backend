import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class MakeTrainerIdNullable1770000000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Изменяем поле trainer_id, чтобы оно могло быть NULL
    await queryRunner.changeColumn(
      'nutrition_plans',
      'trainer_id',
      new TableColumn({
        name: 'trainer_id',
        type: 'integer',
        isNullable: true, // Теперь может быть NULL
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Возвращаем к предыдущему состоянию
    await queryRunner.changeColumn(
      'nutrition_plans',
      'trainer_id',
      new TableColumn({
        name: 'trainer_id',
        type: 'integer',
        isNullable: false, // Было NOT NULL
      }),
    );
  }
}
