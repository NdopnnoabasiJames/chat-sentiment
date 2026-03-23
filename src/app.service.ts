import { Injectable, InternalServerErrorException, BadGatewayException, Logger } from '@nestjs/common';
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
  confidence: number;
  analyzed_text: string;
  used_messages: string[];
}

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

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

      this.logger.debug(`[1/3] Calling FastAPI: POST ${fastApiPredictUrl}`);

      const response = await axios.post<SentimentApiResponse>(
        fastApiPredictUrl,
        {
          agentId,
          conversationId,
          messages,
        },
      );

      this.logger.debug(
        `[2/3] FastAPI response: sentiment=${response.data.overall_sentiment}, confidence=${response.data.confidence}`,
      );

      const sentimentResult = this.sentimentResultRepository.create({
        agentId,
        conversationId,
        sentiment: response.data.overall_sentiment,
        confidence: response.data.confidence,
        messages,
      });

      this.logger.debug(`[3/3] Saving result to database...`);
      const saved = await this.sentimentResultRepository.save(sentimentResult);
      this.logger.debug(`[3/3] Saved with id=${saved.id}`);

      return saved;
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const detail =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message;

        this.logger.error(`FastAPI call failed (${status ?? 'unreachable'}): ${detail}`);

        throw new BadGatewayException(
          `There was a problem with the sentiment analysis service (${status ?? 'unreachable'}): ${detail}`,
        );
      }

      this.logger.error(
        `Unexpected error: ${(error as Error).message}`,
        (error as Error).stack,
      );

      throw new InternalServerErrorException(
        'There was an unexpected problem processing your request. Please try again.',
      );
    }
  }
}
