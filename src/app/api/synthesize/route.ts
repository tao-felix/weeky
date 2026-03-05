import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(req: Request) {
  const { weekNumber, entries } = await req.json();

  // Validate input
  if (!weekNumber || !entries?.length) {
    return new Response('Missing weekNumber or entries', { status: 400 });
  }

  // Cap input to prevent abuse (AI-06)
  const maxEntries = 50;
  const truncatedEntries = entries.slice(0, maxEntries);

  const entriesText = truncatedEntries
    .map((e: { type: string; content: string; createdAt: string }) =>
      `[${e.type}] ${e.createdAt}: ${e.content}`
    )
    .join('\n');

  const result = streamText({
    model: anthropic('claude-haiku-4-5'),
    maxOutputTokens: 500,
    temperature: 0.7,
    system: `You are a personal life archivist. Given a person's week captures, create a card for their life archive.

Output a JSON object with exactly two fields:
- "headline": A short, evocative title (2-5 words) capturing the week's essence. Think magazine headers. Do NOT include "Week N:" prefix.
- "highlights": An array of 3-5 strings, each a concise sentence about a key theme, moment, or insight from the week.

Examples:
{"headline": "Naval & Rebranding", "highlights": ["Deep dive into Naval's philosophy on leverage and specific knowledge.", "Kicked off the company rebrand with new visual direction.", "Reflected on the tension between ambition and presence."]}
{"headline": "The Facebook Path", "highlights": ["Explored Facebook's early growth playbook and network effects.", "Context engineering emerged as a key interest area.", "Wrestled with whether to build for distribution or depth."]}

Output ONLY the JSON object, no markdown, no explanation.`,
    prompt: `Week ${weekNumber} captures:\n\n${entriesText}`,
    onError: ({ error }) => {
      console.error('[synthesis] Stream error:', error);
    },
  });

  return result.toTextStreamResponse();
}
