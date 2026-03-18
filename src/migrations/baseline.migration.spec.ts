import { DataSource, type DataSourceOptions } from 'typeorm';
import { newDb } from 'pg-mem';
import { appEntities } from '../data-source';
import { Baseline1773306775975 } from './1773306775975-Baseline';

describe('Baseline migration smoke', () => {
  let dataSource: DataSource;

  beforeEach(async () => {
    const db = newDb({ autoCreateForeignKeyIndices: true });

    db.public.registerFunction({
      name: 'current_database',
      implementation: () => 'tryer_fit_migration_test',
    });
    db.public.registerFunction({
      name: 'version',
      implementation: () => 'PostgreSQL 15.0',
    });

    dataSource = (await db.adapters.createTypeormDataSource({
      type: 'postgres',
      entities: appEntities,
      migrations: [Baseline1773306775975],
      migrationsTableName: 'typeorm_migrations',
      synchronize: false,
      logging: false,
    } as DataSourceOptions)) as DataSource;

    await dataSource.initialize();
  });

  afterEach(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('baseline migration runs on empty database', async () => {
    const migrations = await dataSource.runMigrations();

    expect(migrations).toHaveLength(1);
    expect(migrations[0]?.name).toBe('Baseline1773306775975');
  });

  it('schema contains expected tables', async () => {
    await dataSource.runMigrations();
    const queryRunner = dataSource.createQueryRunner();

    await expect(queryRunner.hasTable('trainers')).resolves.toBe(true);
    await expect(queryRunner.hasTable('clients')).resolves.toBe(true);
    await expect(queryRunner.hasTable('nutrition_plans')).resolves.toBe(true);
    await expect(queryRunner.hasTable('workout_programs')).resolves.toBe(true);
    await expect(queryRunner.hasTable('chat_messages')).resolves.toBe(true);

    await queryRunner.release();
  });

  it('foreign keys exist for core relations', async () => {
    const migration = new Baseline1773306775975();
    const query = jest.fn<Promise<unknown>, [string]>().mockResolvedValue([]);
    const fakeQueryRunner = { query } as unknown as Parameters<
      Baseline1773306775975['up']
    >[0];

    await migration.up(fakeQueryRunner);

    const executedSql = query.mock.calls.map(([sql]) => sql);

    expect(executedSql).toEqual(
      expect.arrayContaining([
        expect.stringContaining(
          'ALTER TABLE "clients" ADD CONSTRAINT "FK_1c75adeb1f5ad1babdc2129b7d1" FOREIGN KEY ("trainer_id")',
        ),
        expect.stringContaining(
          'ALTER TABLE "nutrition_plans" ADD CONSTRAINT "FK_5716f366fd2703e87fecbd5431a" FOREIGN KEY ("nutrition_category_id")',
        ),
        expect.stringContaining(
          'ALTER TABLE "workout_programs" ADD CONSTRAINT "FK_46af749c8e68c22eb0172b933e7" FOREIGN KEY ("trainer_id")',
        ),
      ]),
    );
  });

  it('typeorm_migrations contains baseline record', async () => {
    await dataSource.runMigrations();

    const rows: Array<{ name: string }> = await dataSource.query(
      'SELECT name FROM typeorm_migrations',
    );

    expect(rows).toEqual(
      expect.arrayContaining([{ name: 'Baseline1773306775975' }]),
    );
  });
});
