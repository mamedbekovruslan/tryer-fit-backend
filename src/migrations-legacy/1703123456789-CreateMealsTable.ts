import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateMealsTable1703123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'meals',
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
            name: 'time',
            type: 'time',
            isNullable: true,
          },
          {
            name: 'calories',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'protein',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'fat',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'carbohydrates',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: true,
          },
          {
            name: 'nutrition_day_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            default: 'now()',
          },
        ],
        foreignKeys: [
          {
            columnNames: ['nutrition_day_id'],
            referencedTableName: 'nutrition_days',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Создание индексов
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_meals_nutrition_day_id ON meals(nutrition_day_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_meals_time ON meals(time);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('meals', true, true, true);
  }
}
