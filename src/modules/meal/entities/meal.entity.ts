import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { MealType } from '../../shared/enums';

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: MealType,
    default: MealType.SNACK,
  })
  mealType: MealType;

  @Column({ name: 'food_name' })
  foodName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  // Nutrition data
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  calories: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  protein: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  carbs: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  fat: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  fiber: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sugar: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  sodium: number;

  // Serving info
  @Column({ name: 'serving_size', type: 'decimal', precision: 10, scale: 2, default: 1 })
  servingSize: number;

  @Column({ name: 'serving_unit', default: 'serving' })
  servingUnit: string;

  // AI analysis metadata
  @Column({ name: 'ai_confidence', type: 'decimal', precision: 5, scale: 2, nullable: true })
  aiConfidence: number;

  @Column({ name: 'ai_raw_response', type: 'jsonb', nullable: true })
  aiRawResponse: Record<string, unknown>;

  // Food items detected (for multi-food images)
  @Column({ name: 'food_items', type: 'jsonb', nullable: true })
  foodItems: Array<{
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    portion: string;
  }>;

  @Column({ name: 'logged_at', type: 'timestamp with time zone' })
  loggedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
