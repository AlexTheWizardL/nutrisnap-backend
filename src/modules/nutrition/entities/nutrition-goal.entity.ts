import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { NutritionGoalType } from '../../shared/enums';

@Entity('nutrition_goals')
export class NutritionGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', unique: true })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    name: 'goal_type',
    type: 'enum',
    enum: NutritionGoalType,
    default: NutritionGoalType.MAINTAIN,
  })
  goalType: NutritionGoalType;

  // Daily targets
  @Column({ name: 'daily_calories', type: 'int', default: 2000 })
  dailyCalories: number;

  @Column({ name: 'daily_protein', type: 'int', default: 50 })
  dailyProtein: number;

  @Column({ name: 'daily_carbs', type: 'int', default: 250 })
  dailyCarbs: number;

  @Column({ name: 'daily_fat', type: 'int', default: 65 })
  dailyFat: number;

  @Column({ name: 'daily_fiber', type: 'int', default: 25 })
  dailyFiber: number;

  @Column({ name: 'daily_water_ml', type: 'int', default: 2000 })
  dailyWaterMl: number;

  // User stats for goal calculation
  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ name: 'weight_unit', default: 'kg' })
  weightUnit: string;

  @Column({ type: 'int', nullable: true })
  height: number;

  @Column({ name: 'height_unit', default: 'cm' })
  heightUnit: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ nullable: true })
  gender: string;

  @Column({ name: 'activity_level', default: 'moderate' })
  activityLevel: string;

  // Dietary preferences
  @Column({ name: 'dietary_restrictions', type: 'text', array: true, default: '{}' })
  dietaryRestrictions: string[];

  @Column({ type: 'text', array: true, default: '{}' })
  allergies: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
