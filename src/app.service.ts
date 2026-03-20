import { Injectable } from '@nestjs/common';
import axios from 'axios';

type ConversationMessage = {
  role: string;
  text: string;
};

@Injectable()
export class AppService {

  async analyzeConversation(messages: ConversationMessage[]): Promise<unknown> {
    try {
      const response = await axios.post('http://127.0.0.1:8000/predict', {
        messages,
      });

      return response.data;
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
