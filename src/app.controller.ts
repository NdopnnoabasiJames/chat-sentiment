import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import {
  ApiBody,
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
  @ApiProperty({
    type: [ConversationMessageDto],
    example: [
      { role: 'customer', text: "I can't login" },
      { role: 'agent', text: 'Please try again' },
    ],
  })
  messages: ConversationMessageDto[];
}

@ApiTags('sentiment')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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

    return this.appService.analyzeConversation(body.messages);
  }
}
