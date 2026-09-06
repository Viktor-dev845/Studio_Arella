import { RequestHandler } from 'express';
import Anthropic from '@anthropic-ai/sdk';

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const SYSTEM_PROMPT = `You are Arella AI, the in-app assistant for Studio Arella — a media platform in Umuahia, Nigeria offering LED billboard advertising and podcast studio rental. Help users with booking ad slots, booking podcast studio sessions, their wallet and payments, and general platform navigation. Be concise, friendly, and practical. You can also help with general questions outside the platform, but keep the tone helpful and on-brand for Studio Arella.`;

interface ChatTurn {
  role: 'user' | 'assistant';
  content: string;
}

export const sendChatMessage: RequestHandler = async (req, res) => {
  try {
    const { messages } = req.body as { messages?: ChatTurn[] };
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ message: 'messages array is required' });
      return;
    }
    if (!client) {
      res.status(503).json({ message: 'Arella AI is not configured yet.' });
      return;
    }

    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 16000,
      output_config: { effort: 'low' },
      system: SYSTEM_PROMPT,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const textBlock = response.content.find((b) => b.type === 'text');
    res.json({ reply: textBlock && 'text' in textBlock ? textBlock.text : '' });
  } catch (err: any) {
    console.error('Chat error:', err);
    if (err instanceof Anthropic.AuthenticationError) {
      res.status(503).json({ message: 'Arella AI is not configured correctly.' });
    } else if (err instanceof Anthropic.RateLimitError) {
      res.status(503).json({ message: "Arella AI is busy right now — please try again in a moment." });
    } else {
      res.status(500).json({ message: 'Arella AI could not respond right now. Please try again.' });
    }
  }
};
