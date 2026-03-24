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
  ) { }

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

  async getAgentAnalytics(agentId: string) {
    const results = await this.sentimentResultRepository.find({
      where: { agentId },
    });

    const total = results.length;

    if (total === 0) {
      return {
        agentId,
        totalConversations: 0,
        positive: 0,
        neutral: 0,
        negative: 0,
        averageConfidence: 0,
      };
    }

    let positive = 0;
    let neutral = 0;
    let negative = 0;
    let confidenceSum = 0;

    for (const r of results) {
      if (r.sentiment === 'positive') positive++;
      else if (r.sentiment === 'neutral') neutral++;
      else if (r.sentiment === 'negative') negative++;

      confidenceSum += r.confidence;
    }

    return {
      agentId,
      totalConversations: total,
      positive,
      neutral,
      negative,
      averageConfidence: Number((confidenceSum / total).toFixed(4)),
    };
  }

  async getAllAgentsAnalytics() {
    const results = await this.sentimentResultRepository.find();

    const agentMap: Record<
      string,
      {
        total: number;
        positive: number;
        negative: number;
        neutral: number;
      }
    > = {};

    for (const r of results) {
      if (!agentMap[r.agentId]) {
        agentMap[r.agentId] = {
          total: 0,
          positive: 0,
          negative: 0,
          neutral: 0,
        };
      }

      const agent = agentMap[r.agentId];

      agent.total++;

      if (r.sentiment === 'positive') agent.positive++;
      else if (r.sentiment === 'negative') agent.negative++;
      else agent.neutral++;
    }

    const analytics = Object.entries(agentMap).map(([agentId, data]) => {
      const positiveRate = data.positive / data.total;
      const negativeRate = data.negative / data.total;

      return {
        agentId,
        totalConversations: data.total,
        positiveRate: Number(positiveRate.toFixed(2)),
        negativeRate: Number(negativeRate.toFixed(2)),
      };
    });

    // sort best → worst (by positive rate)
    analytics.sort((a, b) => b.positiveRate - a.positiveRate);

    return analytics;
  }
}
