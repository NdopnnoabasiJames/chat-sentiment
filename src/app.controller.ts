import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiParam,
  ApiOperation,
  ApiProperty,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AppService } from './app.service';

class ConversationMessageDto {
  @ApiProperty({ example: 'customer' })
  role: string;

  @ApiProperty({ example: "I can't login" })
  text: string;
}

class AnalyzeRequestBodyDto {
  @ApiProperty({ example: 'agent_1' })
  agentId: string;

  @ApiProperty({ example: 'conv_001' })
  conversationId: string;

  @ApiProperty({
    type: [ConversationMessageDto],
    example: [
      { role: 'customer', text: "I can't login" },
      { role: 'agent', text: 'Please try again' },
    ],
  })
  messages: ConversationMessageDto[];
}

class AgentAnalyticsResponseDto {
  @ApiProperty({ example: 'agent_1' })
  agentId: string;

  @ApiProperty({ example: 12 })
  totalConversations: number;

  @ApiProperty({ example: 7 })
  positive: number;

  @ApiProperty({ example: 3 })
  neutral: number;

  @ApiProperty({ example: 2 })
  negative: number;

  @ApiProperty({ example: 0.8421 })
  averageConfidence: number;
}

class AllAgentsAnalyticsResponseDto {
  @ApiProperty({ example: 'agent_1' })
  agentId: string;

  @ApiProperty({ example: 20 })
  totalConversations: number;

  @ApiProperty({ example: 0.75 })
  positiveRate: number;

  @ApiProperty({ example: 0.1 })
  negativeRate: number;
}

@ApiTags('sentiment')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiOperation({ summary: 'Analyze sentiment for a conversation' })
  @ApiBody({ type: AnalyzeRequestBodyDto })
  @ApiResponse({
    status: 200,
    description: 'Sentiment analysis result from FastAPI service',
    schema: {
      type: 'object',
      additionalProperties: true,
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request body. `messages` must be an array.',
  })
  @Post('analyze')
  async analyze(@Body() body: AnalyzeRequestBodyDto): Promise<unknown> {
    if (!Array.isArray(body?.messages)) {
      throw new BadRequestException('`messages` must be an array');
    }
    if (!body?.agentId || !body?.conversationId) {
      throw new BadRequestException('`agentId` and `conversationId` are required');
    }

    return this.appService.analyzeConversation(
      body.agentId,
      body.conversationId,
      body.messages,
    );
  }

  @ApiOperation({ summary: 'Get sentiment analytics for an agent' })
  @ApiParam({
    name: 'agentId',
    description: 'Agent identifier',
    example: 'agent_1',
  })
  @ApiResponse({
    status: 200,
    description: 'Aggregated sentiment metrics for the agent',
    type: AgentAnalyticsResponseDto,
  })
  @Get('analytics/agent/:agentId')
  async getAgentAnalytics(@Param('agentId') agentId: string) {
    return this.appService.getAgentAnalytics(agentId);
  }

  @Get('analytics/agents')
  @ApiOperation({ summary: 'Get analytics for all agents' })
  @ApiResponse({
    status: 200,
    description: 'Ranked analytics across all agents',
    type: AllAgentsAnalyticsResponseDto,
    isArray: true,
  })
  getAllAgentsAnalytics() {
    return this.appService.getAllAgentsAnalytics();
  }
}
