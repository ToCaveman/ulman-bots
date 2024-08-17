import { RESTGetAPIApplicationEmojisResult, Routes } from 'discord-api-types/v10';
import { APIEmoji, REST } from 'discord.js';

const botEmojis: Map<string, APIEmoji> = new Map();

export async function loadEmojis() {
  const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

  const emojis = (await rest.get(Routes.applicationEmojis(process.env.BOT_ID!))) as RESTGetAPIApplicationEmojisResult;

  for (const emoji of emojis.items) {
    botEmojis.set(emoji.name!, emoji);
  }
}

export default function emoji(name: string): string
export default function emoji(name: string, asObject: true): { id: string; name: string, animated: boolean | undefined } | null
export default function emoji(name: string, asObject: boolean | undefined = false) {
  const emoji = botEmojis.get(name);

  if (!emoji) return asObject ? null : '';

  if (asObject) return { id: emoji.id!, name: emoji.name!, animated: emoji.animated };

  return `<${emoji.animated ? 'a' : ''}:${name}:${emoji.id}>`;
}
