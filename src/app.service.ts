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

type SentimentApiResponse = {
  label: string;
  confidence: number;
};

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(SentimentResult)
    private readonly sentimentResultRepository: Repository<SentimentResult>,
  ) {}

  async analyzeConversation(
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
          messages,
        },
      );

      const sentimentResult = this.sentimentResultRepository.create({
        sentiment: response.data.label,
        confidence: response.data.confidence,
        messages,
      });

      return await this.sentimentResultRepository.save(sentimentResult);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiMessage =
          typeof error.response?.data === 'string'
            ? error.response.data
            : error.message;

        throw new Error(`Failed to analyze conversation: ${apiMessage}`);
      }

      throw new Error('Failed to analyze conversation');
    }
  }
}
