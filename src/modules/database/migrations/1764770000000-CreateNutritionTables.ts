import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNutritionTables1764770000000 implements MigrationInterface {
  name = 'CreateNutritionTables1764770000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create meal_type enum
    await queryRunner.query(`
      CREATE TYPE "meal_type_enum" AS ENUM ('breakfast', 'lunch', 'dinner', 'snack')
    `);

    // Create nutrition_goal_type enum
    await queryRunner.query(`
      CREATE TYPE "nutrition_goal_type_enum" AS ENUM ('lose_weight', 'maintain', 'gain_weight', 'build_muscle')
    `);

    // Add telegram to users_provider enum
    await queryRunner.query(`
      ALTER TYPE "public"."users_provider_enum" ADD VALUE IF NOT EXISTS 'telegram'
    `);

    // Create meals table
    await queryRunner.query(`
      CREATE TABLE "meals" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "meal_type" "meal_type_enum" NOT NULL DEFAULT 'snack',
        "food_name" character varying NOT NULL,
        "description" text,
        "image_url" character varying,
        "calories" numeric(10,2) NOT NULL,
        "protein" numeric(10,2) NOT NULL,
        "carbs" numeric(10,2) NOT NULL,
        "fat" numeric(10,2) NOT NULL,
        "fiber" numeric(10,2) NOT NULL DEFAULT '0',
        "sugar" numeric(10,2) NOT NULL DEFAULT '0',
        "sodium" numeric(10,2) NOT NULL DEFAULT '0',
        "serving_size" numeric(10,2) NOT NULL DEFAULT '1',
        "serving_unit" character varying NOT NULL DEFAULT 'serving',
        "ai_confidence" numeric(5,2),
        "ai_raw_response" jsonb,
        "food_items" jsonb,
        "logged_at" TIMESTAMP WITH TIME ZONE NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_meals" PRIMARY KEY ("id")
      )
    `);

    // Create nutrition_goals table
    await queryRunner.query(`
      CREATE TABLE "nutrition_goals" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "goal_type" "nutrition_goal_type_enum" NOT NULL DEFAULT 'maintain',
        "daily_calories" integer NOT NULL DEFAULT '2000',
        "daily_protein" integer NOT NULL DEFAULT '50',
        "daily_carbs" integer NOT NULL DEFAULT '250',
        "daily_fat" integer NOT NULL DEFAULT '65',
        "daily_fiber" integer NOT NULL DEFAULT '25',
        "daily_water_ml" integer NOT NULL DEFAULT '2000',
        "weight" numeric(5,2),
        "weight_unit" character varying NOT NULL DEFAULT 'kg',
        "height" integer,
        "height_unit" character varying NOT NULL DEFAULT 'cm',
        "age" integer,
        "gender" character varying,
        "activity_level" character varying NOT NULL DEFAULT 'moderate',
        "dietary_restrictions" text[] NOT NULL DEFAULT '{}',
        "allergies" text[] NOT NULL DEFAULT '{}',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_nutrition_goals" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_nutrition_goals_user_id" UNIQUE ("user_id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "meals"
      ADD CONSTRAINT "FK_meals_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "nutrition_goals"
      ADD CONSTRAINT "FK_nutrition_goals_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    // Create indexes for performance
    await queryRunner.query(`
      CREATE INDEX "IDX_meals_user_id" ON "meals" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_meals_logged_at" ON "meals" ("logged_at")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_meals_user_logged" ON "meals" ("user_id", "logged_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_meals_user_logged"`);
    await queryRunner.query(`DROP INDEX "IDX_meals_logged_at"`);
    await queryRunner.query(`DROP INDEX "IDX_meals_user_id"`);

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE "nutrition_goals" DROP CONSTRAINT "FK_nutrition_goals_user"`);
    await queryRunner.query(`ALTER TABLE "meals" DROP CONSTRAINT "FK_meals_user"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "nutrition_goals"`);
    await queryRunner.query(`DROP TABLE "meals"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "nutrition_goal_type_enum"`);
    await queryRunner.query(`DROP TYPE "meal_type_enum"`);
  }
}
