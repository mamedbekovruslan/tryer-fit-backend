import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTrainerTable1735904450000 implements MigrationInterface {
    name = 'CreateTrainerTable1735904450000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "trainers" (
                "id" SERIAL NOT NULL,
                "username" character varying NOT NULL,
                "email" character varying NOT NULL,
                "password_hash" character varying NOT NULL,
                "first_name" character varying,
                "last_name" character varying,
                "middle_name" character varying,
                "gender" character varying,
                "height" DECIMAL(5,2),
                "weight" DECIMAL(5,2),
                "phone" character varying,
                "birth_date" DATE,
                "education" text,
                "institution" text,
                "degree" text,
                "specialization" text,
                "certificate_number" text,
                "photo_urls" text[],
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_trainers_username" UNIQUE ("username"),
                CONSTRAINT "UQ_trainers_email" UNIQUE ("email"),
                CONSTRAINT "PK_trainers_id" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "trainers"`);
    }

}