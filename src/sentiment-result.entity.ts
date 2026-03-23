import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class SentimentResult {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  agentId: string;

  @Column()
  conversationId: string;

  @Column()
  sentiment: string;

  @Column('float')
  confidence: number;

  @Column({ type: 'jsonb' })
  messages: any;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
