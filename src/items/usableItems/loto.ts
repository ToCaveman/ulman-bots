import chance, { ChanceValue } from '../helpers/chance';
import itemList, { ItemKey } from '../itemList';
import { UsableItemFunc } from '../../interfaces/Item';
import findUser from '../../economy/findUser';
import intReply from '../../utils/intReply';
import errorEmbed from '../../embeds/errorEmbed';
import embedTemplate from '../../embeds/embedTemplate';
import itemString from '../../embeds/helpers/itemString';
import shuffleArray from '../helpers/shuffleArray';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentEmojiResolvable,
  ComponentType,
} from 'discord.js';
import buttonHandler from '../../embeds/buttonHandler';
import addLati from '../../economy/addLati';
import addItems from '../../economy/addItems';
import smallEmbed from '../../embeds/smallEmbed';
import commandColors from '../../embeds/commandColors';
import emoji from '../../utils/emoji';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function testLaimesti(options: LotoOptions, count: number) {
  console.log(`Started testing ${count} spins`);
  let totalLati = 0;

  for (let i = 0; i < count; i++) {
    if (i % 100_000 === 0) console.log(`i = ${i}`);
    const lotoArr = generateLotoArr(options);
    // scrach first x items
    lotoArr.forEach((item, index) => {
      if (index < options.scratches) item.scratched = true;
    });

    const calcRes = calcTotal(lotoArr);
    totalLati += calcRes.total;
  }

  console.log(`Finished testing ${count} spins`);
  const avg = (totalLati / count).toFixed(3);
  console.log(`Avg reward: ${avg} lati`);
}

// prettier-ignore
export type LotoReward = {
  lati: number;
  multiplier?: never;
  emoji: () => string;
  chance: ChanceValue;
} | {
  lati?: never;
  multiplier: number;
  emoji: () => string;
  chance: ChanceValue;
}

export interface LotoOptions {
  rows: number;
  columns: number;
  scratches: number;
  minRewards: number;
  maxRewards: number;
  rewards: Record<string, LotoReward>; // pirmais rewards ir garantēts
  colors: { lati: number; color: number }[];
}

type LotoArray = {
  reward: LotoReward | null;
  scratched: boolean;
}[];

function generateLotoArr(
  { rows, columns, minRewards, maxRewards, rewards }: LotoOptions,
  printBoard = false
): LotoArray {
  const rewardsCount = Math.floor(Math.random() * (maxRewards - minRewards) + minRewards);

  const array = Array.from({ length: rows * columns }, (_, index) => {
    if (index === 0) return rewards[Object.keys(rewards)[0]];
    if (index < rewardsCount) return chance(rewards).obj as LotoReward;
    return null;
  }).map(reward => ({ reward, scratched: false }));

  const shuffled = shuffleArray(array);

  if (printBoard) {
    console.log('-'.repeat(columns * 10));
    for (let row = 0; row < rows; row++) {
      console.log(
        shuffled
          .slice(row * columns, (row + 1) * columns)
          .map(i =>
            (i.reward?.lati ? `${i.reward?.lati}Ls` : i.reward?.multiplier ? `${i.reward?.multiplier}x` : '').padEnd(7)
          )
          .join(' | ')
      );
      console.log('-'.repeat(columns * 10));
    }
  }

  return shuffled;
}

function scratchesLeftText(scratchesLeft: number, format = false) {
  const boldStr = format ? '**' : '';

  return scratchesLeft === 1
    ? `Atlicis ${boldStr}1${boldStr} skrāpējums`
    : `Atlikuši ${boldStr}${scratchesLeft}${boldStr} skrāpējumi`;
}

function lotoEmbed(
  i: ButtonInteraction | ChatInputCommandInteraction,
  itemKey: ItemKey,
  lotoArrWon: LotoArray,
  { colors }: LotoOptions,
  totalWin: number,
  scratchesLeft: number
) {
  const latiArr = lotoArrWon.filter(item => item.reward?.lati);
  const multiplierArr = lotoArrWon.filter(item => item.reward?.multiplier);
  const color = scratchesLeft ? commandColors.feniks : colors.find(({ lati }) => totalWin >= lati)!.color;

  return embedTemplate({
    i,
    title: `Izmantot: ${itemString(itemKey, null, true)}`,
    description: scratchesLeftText(scratchesLeft, true),
    color,
    fields: [
      {
        name: 'Atrastie lati:',
        value: latiArr.length ? latiArr.map(item => item.reward?.emoji()).join(' + ') : '-',
        inline: false,
      },
      {
        name: 'Atrastie reizinātāji:',
        value:
          `${multiplierArr.length ? multiplierArr.map(item => item.reward?.emoji()).join(' + ') : '-'}\n\n` +
          (scratchesLeft
            ? `_Spied uz_ ${emoji('loto_question_mark')} _lai atklātu balvas_`
            : `**KOPĒJAIS LAIMESTS: __${totalWin}__ lati**`),
        inline: false,
      },
    ],
  }).embeds;
}

function lotoComponents(
  itemKey: ItemKey,
  lotoArray: LotoArray,
  { rows, columns }: LotoOptions,
  scratchesLeft: number,
  hasEnded = false,
  lotoInInv = 0
) {
  const actionRows: ActionRowBuilder<ButtonBuilder>[] = [];

  for (let row = 0; row < rows; row++) {
    actionRows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        Array.from({ length: columns }, (_, index) => {
          const lotoArrIndex = row * columns + index;
          const { reward, scratched } = lotoArray[lotoArrIndex];

          const btnEmoji: ComponentEmojiResolvable =
            hasEnded || scratched
              ? reward
                ? reward.emoji() //
                : emoji('blank')
              : emoji('loto_question_mark');

          const btn = new ButtonBuilder()
            .setCustomId(`${itemKey}-${lotoArrIndex}`)
            .setStyle(scratched ? (reward ? ButtonStyle.Success : ButtonStyle.Danger) : ButtonStyle.Secondary)
            .setEmoji(btnEmoji)
            .setDisabled(hasEnded);

          // temp
          if ((hasEnded || scratched) && reward) {
            // btn.setLabel(reward.lati ? `${reward.lati} lati` : `${reward.multiplier}x`);
          }

          return btn;
        })
      )
    );
  }

  if (!hasEnded || (hasEnded && !lotoInInv)) {
    actionRows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('_')
          .setStyle(ButtonStyle.Secondary)
          .setLabel(scratchesLeftText(scratchesLeft))
          .setDisabled(true)
      )
    );
  } else if (lotoInInv) {
    actionRows.push(
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('loto_izmantot_velreiz')
          .setStyle(ButtonStyle.Primary)
          .setLabel(`Izmantot vēlreiz (${lotoInInv})`)
          .setEmoji(itemList[itemKey].emoji() || '❓')
      )
    );
  }

  return actionRows;
}

function calcTotal(lotoArray: LotoArray) {
  const filtered = lotoArray.filter(({ scratched, reward }) => scratched && reward) as {
    reward: LotoReward;
    scratched: boolean;
  }[];

  const sorted = filtered.sort((a, b) => {
    if (a.reward.lati && b.reward.multiplier) return -1;
    if (a.reward.lati && b.reward.lati) return b.reward.lati - a.reward.lati;
    if (a.reward.multiplier && b.reward.multiplier) return b.reward.multiplier - a.reward.multiplier;

    return 0;
  });

  const latiSum = sorted.reduce((p, c) => (c.reward.lati ? p + c.reward.lati : p), 0);
  const multiplierSum = sorted.reduce((p, c) => (c.reward.multiplier ? p + c.reward.multiplier : p), 0);

  return {
    sorted,
    total: multiplierSum ? multiplierSum * latiSum : latiSum,
  };
}

const TEST_SPINS = false;

export default function loto(itemKey: ItemKey, options: LotoOptions): UsableItemFunc {
  return () => ({
    custom: async i => {
      if (TEST_SPINS) {
        await intReply(i, smallEmbed('Testing spins...', 0xffffff));
        testLaimesti(options, 1_000_000);
        return;
      }

      const userId = i.user.id;
      const guildId = i.guildId!;

      let user = await findUser(userId, guildId);
      if (!user) return intReply(i, errorEmbed);

      const lotoArray = generateLotoArr(options);
      const buttonCount = options.rows * options.columns;
      let scratchesLeft = options.scratches;
      let latiAdded = false;
      let lotoInInv = 0;

      const msg = await intReply(i, {
        content: '\u200b',
        embeds: lotoEmbed(i, itemKey, [], options, 0, scratchesLeft),
        components: lotoComponents(itemKey, lotoArray, options, scratchesLeft),
        fetchReply: true,
      });
      if (!msg) return;

      buttonHandler(
        i,
        `izmantot`,
        msg,
        async int => {
          const { customId } = int;
          if (int.componentType !== ComponentType.Button) return;

          if (customId === 'loto_izmantot_velreiz') {
            if (scratchesLeft) return;

            return {
              end: true,
              after: async () => {
                // ahhh nepatīk šitais imports dritvai kociņ, lūdzu neesi atmiņas noplūde
                const izmantotRun = await import('../../commands/economyCommands/izmantot/izmantotRun');
                izmantotRun.default(int, itemKey, 0);
              },
            };
          }

          if (scratchesLeft <= 0) return;
          const [btnItemKey, btnIndexStr] = customId.split('-');
          const btnIndex = +btnIndexStr;

          if (btnItemKey !== itemKey || isNaN(btnIndex) || btnIndex < 0 || btnIndex >= buttonCount) return;

          const clickedItem = lotoArray[btnIndex];
          if (!clickedItem || clickedItem.scratched) return;

          clickedItem.scratched = true;
          scratchesLeft--;

          if (options.scratches - scratchesLeft === 1) {
            await addItems(userId, guildId, { [itemKey]: -1 });
          }

          const hasEnded = scratchesLeft <= 0;

          const { total, sorted } = calcTotal(lotoArray);

          if (hasEnded && !latiAdded) {
            latiAdded = true;
            user = total ? await addLati(userId, guildId, total) : await findUser(userId, guildId);
            if (user) {
              lotoInInv = user.items.find(item => item.name === itemKey)?.amount || 0;
            }
          }

          return {
            edit: {
              embeds: lotoEmbed(int, itemKey, sorted, options, total, scratchesLeft),
              components: lotoComponents(itemKey, lotoArray, options, scratchesLeft, hasEnded, lotoInInv),
            },
            setInactive: hasEnded,
          };
        },
        60000,
        true
      );
    },
  });
}
