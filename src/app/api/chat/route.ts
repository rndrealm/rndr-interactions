import { anthropic } from "@ai-sdk/anthropic";
import {
  streamText,
  tool,
  createUIMessageStreamResponse,
  toUIMessageStream,
  convertToModelMessages,
  UIMessage,
  isStepCount,
} from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, model = "claude-sonnet-4-6" }: { messages: UIMessage[]; model?: string } =
    await req.json();

  const result = streamText({
    model: anthropic(model),
    system: `You are a web3 AI agent that helps users interact with DeFi protocols.
You can perform token swaps, check wallet balances, and explain transactions.
The user's wallet is already connected — never ask for a wallet address.
When a user wants to check a balance, use the checkBalance tool immediately.
Keep responses concise and helpful.`,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(5),
    tools: {
      checkBalance: tool({
        description:
          "Check the token balance of the user's connected wallet. Use this when the user asks about their balance or holdings.",
        inputSchema: z.object({
          token: z
            .string()
            .optional()
            .describe("Specific token to check. If omitted, returns all balances."),
        }),
        execute: async ({ token }) => {
          const address = "0x1a2B...9fE4";
          const balances = {
            ETH: 2.451,
            USDC: 5420.0,
            WBTC: 0.125,
            ARB: 3200.0,
          };

          if (token) {
            return {
              address,
              balances: {
                [token]:
                  balances[token as keyof typeof balances] ?? 0,
              },
            };
          }
          return { address, balances };
        },
      }),
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
