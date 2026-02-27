import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

export class CreateChatMessagesTable1770300000000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: 'chat_messages',
            columns: [
                {
                    name: 'id',
                    type: 'integer',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'sender_id',
                    type: 'integer',
                    isNullable: false,
                },
                {
                    name: 'receiver_id',
                    type: 'integer',
                    isNullable: false,
                },
                {
                    name: 'sender_type',
                    type: 'enum',
                    enum: ['client', 'trainer'],
                    isNullable: false,
                },
                {
                    name: 'message',
                    type: 'text',
                    isNullable: false,
                },
                {
                    name: 'is_read',
                    type: 'boolean',
                    default: false,
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
        }), true);

        // Создаем индексы для улучшения производительности
        await queryRunner.createIndex(
            'chat_messages',
            new TableIndex({
                name: 'idx_chat_messages_sender_receiver',
                columnNames: ['sender_id', 'receiver_id'],
            })
        );

        await queryRunner.createIndex(
            'chat_messages',
            new TableIndex({
                name: 'idx_chat_messages_created_at',
                columnNames: ['created_at'],
            })
        );

        await queryRunner.createIndex(
            'chat_messages',
            new TableIndex({
                name: 'idx_chat_messages_is_read',
                columnNames: ['is_read'],
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('chat_messages');
    }

}
