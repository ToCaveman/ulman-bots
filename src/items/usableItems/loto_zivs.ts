import { ActionRowBuilder, BaseInteraction, ComponentType, StringSelectMenuBuilder } from 'discord.js';
import addItems from '../../economy/addItems';
import findUser from '../../economy/findUser';
import removeItemsById from '../../economy/removeItemsById';
import commandColors from '../../embeds/commandColors';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import itemString from '../../embeds/helpers/itemString';
import { UsableItemFunc } from '../../interfaces/Item';
import intReply from '../../utils/intReply';
import chance, { ChanceObj, ChanceRecord } from '../helpers/chance';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import itemList, { ItemKey } from '../itemList';
import UserProfile from '../../interfaces/UserProfile';
import emoji from '../../utils/emoji';
import mongoTransaction from '../../utils/mongoTransaction';
import { Dialogs } from '../../utils/Dialogs';
import { useDifferentItemHandler, useDifferentItemSelectMenu } from '../../utils/useDifferentItem';

const fishCountChance: ChanceRecord = {
  3: { chance: '*' }, // 0.25
  4: { chance: '*' }, // 0.25
  5: { chance: 0.2 },
  6: { chance: 0.15 },
  7: { chance: 0.1 },
  8: { chance: 0.05 },
};

export function generateFishCount() {
  return +chance(fishCountChance).key;
}

const lotoFishChanceObj: Record<ItemKey, ChanceObj> = {
  lidaka: { chance: '*' },
  asaris: { chance: '*' },
  lasis: { chance: '*' },
  petniekzivs: { chance: 0.15 },
  juridiska_zivs: { chance: 0.1 },
  divaina_zivs: { chance: 0.1 },
};

type State = {
  user: UserProfile;
  itemId: string;
  wonFishArr: ItemKey[];
  wonFishObj: Record<ItemKey, number>;
  isSpinning: boolean;
};

function view(state: State, i: BaseInteraction) {
  const emptyEmoji = emoji('blank');
  const arrow_1_left = emoji('icon_arrow_1_left');
  const arrow_1_right = emoji('icon_arrow_1_right');
  const arrow_2_left = emoji('icon_arrow_2_left');
  const arrow_2_right = emoji('icon_arrow_2_right');

  const components: ActionRowBuilder<StringSelectMenuBuilder>[] = [];

  if (!state.isSpinning && state.user.specialItems.filter(({ name }) => name === 'loto_zivs').length) {
    components.push(useDifferentItemSelectMenu(state.user, 'loto_zivs', state.itemId));
  }

  return embedTemplate({
    i,
    color: state.isSpinning ? commandColors.feniks : 0xf080ff,
    title: `Izmantot: ${itemString(itemList.loto_zivs, null, true)} (satur ${state.wonFishArr.length} zivis)`,
    description:
      (state.isSpinning ? arrow_1_right : arrow_2_right) +
      emptyEmoji +
      (state.isSpinning
        ? Array(state.wonFishArr.length).fill(emoji('icon_loto_zivs_spin'))
        : state.wonFishArr.map(key => itemList[key].emoji())
      ).join(' ') +
      emptyEmoji +
      (state.isSpinning ? arrow_1_left : arrow_2_left),
    fields: state.isSpinning
      ? []
      : [
          {
            name: 'Tu laimēji:',
            value: Object.entries(state.wonFishObj)
              .map(([key, amount]) => itemString(itemList[key], amount, true))
              .join('\n'),
            inline: true,
          },
        ],
    components,
  });
}

const loto_zivs: UsableItemFunc = (userId, guildId, _, specialItem) => {
  return {
    custom: async i => {
      const holdsFishCount = specialItem!.attributes.holdsFishCount!;

      const user = await findUser(userId, guildId);
      if (!user) return intReply(i, errorEmbed);

      const freeSlots = countFreeInvSlots(user);

      if (freeSlots < holdsFishCount - 1) {
        return intReply(
          i,
          ephemeralReply(
            `Lai izmantotu ${itemString(itemList.loto_zivs, null, true)} kas satur **${holdsFishCount}** zivis, ` +
              `tev inventārā ir jābūt vismaz **${holdsFishCount - 1}** brīvām vietām\n` +
              `Tev ir ${freeSlots} brīvas vietas`,
          ),
        );
      }

      const wonFishObj: Record<ItemKey, number> = {};
      const wonFishArr: ItemKey[] = [];
      for (let i = 0; i < holdsFishCount; i++) {
        const { key } = chance(lotoFishChanceObj);
        wonFishArr.push(key);
        wonFishObj[key] = wonFishObj[key] ? wonFishObj[key] + 1 : 1;
      }

      const { ok, values } = await mongoTransaction(session => [
        () => addItems(userId, guildId, { ...wonFishObj }, session),
        () => removeItemsById(userId, guildId, [specialItem!._id!], session),
      ]);

      if (!ok) return intReply(i, errorEmbed);

      const userNew = values[1];

      const initialState: State = {
        user: userNew,
        itemId: specialItem!._id!,
        wonFishArr,
        wonFishObj,
        isSpinning: true,
      };

      const dialogs = new Dialogs(i, initialState, view, 'izmantot', { time: 30000, isActive: true });

      if (!(await dialogs.start())) {
        return intReply(i, errorEmbed);
      }

      setTimeout(async () => {
        dialogs.state.isSpinning = false;
        await dialogs.edit();
        dialogs.setActive(false);
      }, 1000);

      dialogs.onClick(async (int, state) => {
        if (state.isSpinning) return {};

        const user = await findUser(userId, guildId);
        if (!user) return { error: true };

        state.user = user;

        if (int.customId === 'use_different' && int.componentType === ComponentType.StringSelect) {
          return useDifferentItemHandler(user, 'loto_zivs', int);
        }
      });
    },
  };
};

export default loto_zivs;
