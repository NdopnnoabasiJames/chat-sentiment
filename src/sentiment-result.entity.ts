import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SentimentResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  sentiment: string;

  @Column('float')
  confidence: number;

  @Column({ type: 'json' })
  messages: unknown;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
