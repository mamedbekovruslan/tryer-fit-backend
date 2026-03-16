import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateClientNutritionPlansTable1703123456791 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'client_nutrition_plans',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'client_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'nutrition_plan_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'is_active',
            type: 'boolean',
            default: false,
          },
          {
            name: 'assigned_at',
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
            columnNames: ['client_id'],
            referencedTableName: 'clients',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['nutrition_plan_id'],
            referencedTableName: 'nutrition_plans',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );

    // Создание индексов
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_client_nutrition_plans_client_id ON client_nutrition_plans(client_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_client_nutrition_plans_nutrition_plan_id ON client_nutrition_plans(nutrition_plan_id);
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_client_nutrition_plans_is_active ON client_nutrition_plans(is_active);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('client_nutrition_plans', true, true, true);
  }
}
