import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Repository } from 'typeorm';
import { SentimentResult } from './sentiment-result.entity';

type ConversationMessage = {
  role: string;
  text: string;
};

interface SentimentApiResponse {
  overall_sentiment: string;
  score: number;
  messages: {
    text: string;
    label: string;
    confidence: number;
  }[];
}

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(SentimentResult)
    private readonly sentimentResultRepository: Repository<SentimentResult>,
  ) {}

  async analyzeConversation(
    agentId: string,
    conversationId: string,
    messages: ConversationMessage[],
  ): Promise<SentimentResult> {
    try {
      const fastApiPredictUrl = this.configService.get<string>(
        'FASTAPI_PREDICT_URL',
        'http://127.0.0.1:8000/predict',
      );

      const response = await axios.post<SentimentApiResponse>(
        fastApiPredictUrl,
        {
          agentId,
          conversationId,
          messages,
        },
      );

      const sentimentResult = this.sentimentResultRepository.create({
        agentId,
        conversationId,
        sentiment: response.data.overall_sentiment,
        confidence: response.data.score,
        messages,
      });
 
      return await this.sentimentResultRepository.save(sentimentResult);
    } catch (error: unknown) {
      console.error('FULL ERROR:', error);

      if (axios.isAxiosError(error)) {
        console.error('AXIOS ERROR DATA:', error.response?.data);

        const apiMessage =
          typeof error.response?.data === 'string'
            ? error.response.data
            : JSON.stringify(error.response?.data);

        throw new Error(`Failed to analyze conversation: ${apiMessage}`);
      }

      throw new Error(
        `Failed to analyze conversation: ${
          (error as Error).message || 'Unknown error'
        }`,
      );
    }
  }
}
