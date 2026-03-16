import { MigrationInterface, QueryRunner } from 'typeorm';

export class Baseline1773306775975 implements MigrationInterface {
    name = 'Baseline1773306775975'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "trainers" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "middle_name" character varying, "gender" character varying, "height" numeric(5,2), "weight" numeric(5,2), "phone" character varying, "birth_date" date, "education" text, "institution" text, "degree" text, "specialization" text, "certificate_number" text, "photo_urls" text array, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5e05fefccf71272eadb3f4bfbe5" UNIQUE ("username"), CONSTRAINT "UQ_f8ac7db7ae932e9e2bb7de0e466" UNIQUE ("email"), CONSTRAINT "PK_198da56395c269936d351ab774b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."clients_fitness_goal_enum" AS ENUM('weight_loss', 'muscle_gain', 'endurance', 'flexibility', 'general_fitness')`);
        await queryRunner.query(`CREATE TABLE "clients" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "first_name" character varying, "last_name" character varying, "waist_circumference" numeric(5,2), "chest_circumference" numeric(5,2), "hip_circumference" numeric(5,2), "arm_circumference" numeric(5,2), "leg_circumference" numeric(5,2), "fitness_goal" "public"."clients_fitness_goal_enum", "expected_result" text, "contraindications" text, "diseases" text, "limitations" text, "training_experience" text, "current_diet" text, "photo_urls" text array, "weight" numeric(5,2), "body_fat" numeric(5,2), "muscle_mass" numeric(5,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "trainer_id" integer, CONSTRAINT "UQ_a95860aa92d1420e005893043de" UNIQUE ("username"), CONSTRAINT "UQ_b48860677afe62cd96e12659482" UNIQUE ("email"), CONSTRAINT "PK_f1ab7cf3a5714dbc6bb4e1c28a4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "progress_report_comments" ("id" SERIAL NOT NULL, "comment" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "report_id" integer NOT NULL, "trainer_id" integer NOT NULL, CONSTRAINT "PK_c4bcf0957ba5fc466c30a2eb8bf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "progress_reports" ("id" SERIAL NOT NULL, "date" TIMESTAMP NOT NULL, "weight" numeric(5,2), "waist" numeric(5,2), "hips" numeric(5,2), "chest" numeric(5,2), "arms" numeric(5,2), "thighs" numeric(5,2), "body_fat" numeric(5,2), "muscle_mass" numeric(5,2), "notes" text, "photo_urls" text array, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "client_id" integer NOT NULL, CONSTRAINT "PK_175179020a43d5ec75ab1d6a04f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "nutrition_categories" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7b84c70689bd43f1623ceccea87" UNIQUE ("name"), CONSTRAINT "PK_6b069882bf9cd28130ce302c694" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "nutrition_plans" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "nutrition_category_id" integer NOT NULL, "trainer_id" integer, CONSTRAINT "PK_d4fe9565a376834cdea3b4b771a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "meals" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "nutrition_day_id" integer NOT NULL, CONSTRAINT "PK_e6f830ac9b463433b58ad6f1a59" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "nutrition_days" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, "nutrition_category_id" integer, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "nutrition_plan_id" integer NOT NULL, CONSTRAINT "PK_96d3a36828efcfc9d74980cdcd1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "client_nutrition_plans" ("id" SERIAL NOT NULL, "is_active" boolean NOT NULL DEFAULT false, "assigned_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "client_id" integer NOT NULL, "nutrition_plan_id" integer NOT NULL, CONSTRAINT "PK_d201c7d0e230502b9efbd539b92" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "exercises" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, "sets" integer, "reps" character varying(50), "weight" character varying(50), "rest_time" character varying(50), "exercise_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "workout_day_id" integer NOT NULL, CONSTRAINT "PK_c4c46f5fa89a58ba7c2d894e3c3" PRIMARY KEY ("id")); COMMENT ON COLUMN "exercises"."sets" IS 'Количество подходов'; COMMENT ON COLUMN "exercises"."reps" IS 'Количество повторений'; COMMENT ON COLUMN "exercises"."weight" IS 'Вес'; COMMENT ON COLUMN "exercises"."rest_time" IS 'Время отдыха'`);
        await queryRunner.query(`CREATE TABLE "workout_days" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, "day_order" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "workout_program_id" integer NOT NULL, CONSTRAINT "PK_bc5724d5cb04625732f1bab0965" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workout_programs" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "workout_category_id" integer NOT NULL, "trainer_id" integer, CONSTRAINT "PK_edea9670490ad037235eb88edc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "workout_categories" ("id" SERIAL NOT NULL, "name" character varying(100) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_b75fcf7b3b8a80ea4adb787a3c5" UNIQUE ("name"), CONSTRAINT "PK_b831918f0ae12ec56cb593c6382" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "client_workout_programs" ("id" SERIAL NOT NULL, "is_active" boolean NOT NULL DEFAULT false, "assigned_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "client_id" integer NOT NULL, "workout_program_id" integer NOT NULL, CONSTRAINT "PK_c58883926dbba2ac8c0b485179b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."chat_messages_sender_type_enum" AS ENUM('client', 'trainer')`);
        await queryRunner.query(`CREATE TABLE "chat_messages" ("id" SERIAL NOT NULL, "sender_id" integer NOT NULL, "receiver_id" integer NOT NULL, "sender_type" "public"."chat_messages_sender_type_enum" NOT NULL, "message" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_40c55ee0e571e268b0d3cd37d10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "FK_1c75adeb1f5ad1babdc2129b7d1" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progress_report_comments" ADD CONSTRAINT "FK_e76478dde68e0a190d0c08347c7" FOREIGN KEY ("report_id") REFERENCES "progress_reports"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progress_report_comments" ADD CONSTRAINT "FK_4532e3b74834762ccebfa5816d7" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "progress_reports" ADD CONSTRAINT "FK_5432e59f43988a56dc701d3b6c1" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nutrition_plans" ADD CONSTRAINT "FK_5716f366fd2703e87fecbd5431a" FOREIGN KEY ("nutrition_category_id") REFERENCES "nutrition_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nutrition_plans" ADD CONSTRAINT "FK_7bcc502efaee407de1ec463c83b" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "meals" ADD CONSTRAINT "FK_e385d48c0a6c776de6ea0c24a8d" FOREIGN KEY ("nutrition_day_id") REFERENCES "nutrition_days"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "nutrition_days" ADD CONSTRAINT "FK_03bd1e52fe5204a3cc2eb4863d0" FOREIGN KEY ("nutrition_plan_id") REFERENCES "nutrition_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_nutrition_plans" ADD CONSTRAINT "FK_a8307997f0a5531a7a542b46cc2" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_nutrition_plans" ADD CONSTRAINT "FK_0df56119a5f990f5e1e62bfd81b" FOREIGN KEY ("nutrition_plan_id") REFERENCES "nutrition_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exercises" ADD CONSTRAINT "FK_af446695a3f98b2cc3bc3fe5bab" FOREIGN KEY ("workout_day_id") REFERENCES "workout_days"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workout_days" ADD CONSTRAINT "FK_17a55af49f8a17172d31cc50a61" FOREIGN KEY ("workout_program_id") REFERENCES "workout_programs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workout_programs" ADD CONSTRAINT "FK_eaca8d2adb8f17bb8b18858da21" FOREIGN KEY ("workout_category_id") REFERENCES "workout_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "workout_programs" ADD CONSTRAINT "FK_46af749c8e68c22eb0172b933e7" FOREIGN KEY ("trainer_id") REFERENCES "trainers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_workout_programs" ADD CONSTRAINT "FK_bd6ec77d8c91470353007bb84a6" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "client_workout_programs" ADD CONSTRAINT "FK_d608f5a1f52c02dbb2c8484b53b" FOREIGN KEY ("workout_program_id") REFERENCES "workout_programs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "client_workout_programs" DROP CONSTRAINT "FK_d608f5a1f52c02dbb2c8484b53b"`);
        await queryRunner.query(`ALTER TABLE "client_workout_programs" DROP CONSTRAINT "FK_bd6ec77d8c91470353007bb84a6"`);
        await queryRunner.query(`ALTER TABLE "workout_programs" DROP CONSTRAINT "FK_46af749c8e68c22eb0172b933e7"`);
        await queryRunner.query(`ALTER TABLE "workout_programs" DROP CONSTRAINT "FK_eaca8d2adb8f17bb8b18858da21"`);
        await queryRunner.query(`ALTER TABLE "workout_days" DROP CONSTRAINT "FK_17a55af49f8a17172d31cc50a61"`);
        await queryRunner.query(`ALTER TABLE "exercises" DROP CONSTRAINT "FK_af446695a3f98b2cc3bc3fe5bab"`);
        await queryRunner.query(`ALTER TABLE "client_nutrition_plans" DROP CONSTRAINT "FK_0df56119a5f990f5e1e62bfd81b"`);
        await queryRunner.query(`ALTER TABLE "client_nutrition_plans" DROP CONSTRAINT "FK_a8307997f0a5531a7a542b46cc2"`);
        await queryRunner.query(`ALTER TABLE "nutrition_days" DROP CONSTRAINT "FK_03bd1e52fe5204a3cc2eb4863d0"`);
        await queryRunner.query(`ALTER TABLE "meals" DROP CONSTRAINT "FK_e385d48c0a6c776de6ea0c24a8d"`);
        await queryRunner.query(`ALTER TABLE "nutrition_plans" DROP CONSTRAINT "FK_7bcc502efaee407de1ec463c83b"`);
        await queryRunner.query(`ALTER TABLE "nutrition_plans" DROP CONSTRAINT "FK_5716f366fd2703e87fecbd5431a"`);
        await queryRunner.query(`ALTER TABLE "progress_reports" DROP CONSTRAINT "FK_5432e59f43988a56dc701d3b6c1"`);
        await queryRunner.query(`ALTER TABLE "progress_report_comments" DROP CONSTRAINT "FK_4532e3b74834762ccebfa5816d7"`);
        await queryRunner.query(`ALTER TABLE "progress_report_comments" DROP CONSTRAINT "FK_e76478dde68e0a190d0c08347c7"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "FK_1c75adeb1f5ad1babdc2129b7d1"`);
        await queryRunner.query(`DROP TABLE "chat_messages"`);
        await queryRunner.query(`DROP TYPE "public"."chat_messages_sender_type_enum"`);
        await queryRunner.query(`DROP TABLE "client_workout_programs"`);
        await queryRunner.query(`DROP TABLE "workout_categories"`);
        await queryRunner.query(`DROP TABLE "workout_programs"`);
        await queryRunner.query(`DROP TABLE "workout_days"`);
        await queryRunner.query(`DROP TABLE "exercises"`);
        await queryRunner.query(`DROP TABLE "client_nutrition_plans"`);
        await queryRunner.query(`DROP TABLE "nutrition_days"`);
        await queryRunner.query(`DROP TABLE "meals"`);
        await queryRunner.query(`DROP TABLE "nutrition_plans"`);
        await queryRunner.query(`DROP TABLE "nutrition_categories"`);
        await queryRunner.query(`DROP TABLE "progress_reports"`);
        await queryRunner.query(`DROP TABLE "progress_report_comments"`);
        await queryRunner.query(`DROP TABLE "clients"`);
        await queryRunner.query(`DROP TYPE "public"."clients_fitness_goal_enum"`);
        await queryRunner.query(`DROP TABLE "trainers"`);
    }

}
