import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
  TableIndex,
} from 'typeorm';

export class CreateProgressReportCommentsTable1771000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'progress_report_comments',
        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'report_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'trainer_id',
            type: 'integer',
            isNullable: false,
          },
          {
            name: 'comment',
            type: 'text',
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
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'progress_report_comments',
      new TableForeignKey({
        columnNames: ['report_id'],
        referencedTableName: 'progress_reports',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'progress_report_comments',
      new TableForeignKey({
        columnNames: ['trainer_id'],
        referencedTableName: 'trainers',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createIndex(
      'progress_report_comments',
      new TableIndex({
        name: 'idx_progress_report_comments_report_id',
        columnNames: ['report_id'],
      }),
    );

    await queryRunner.createIndex(
      'progress_report_comments',
      new TableIndex({
        name: 'idx_progress_report_comments_trainer_id',
        columnNames: ['trainer_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('progress_report_comments');
  }
}
