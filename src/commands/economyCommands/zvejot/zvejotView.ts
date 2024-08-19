import {
  ActionRowBuilder,
  BaseInteraction,
  bold,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
  time,
  underline,
} from 'discord.js';
import UserProfile, { ItemAttributes, UserFishing } from '../../../interfaces/UserProfile';
import { countFish } from './syncFishing';
import commandColors from '../../../embeds/commandColors';
import embedTemplate from '../../../embeds/embedTemplate';
import itemString from '../../../embeds/helpers/itemString';
import latiString from '../../../embeds/helpers/latiString';
import maksekeresData from './makskeresData';
import itemList, { ItemCategory } from '../../../items/itemList';
import millisToReadableTime from '../../../embeds/helpers/millisToReadableTime';
import emoji from '../../../utils/emoji';
import capitalizeFirst from '../../../embeds/helpers/capitalizeFirst';
import { displayAttributes } from '../../../embeds/helpers/displayAttributes';
import { AttributeItem } from '../../../interfaces/Item';
import { calcRepairCost } from './zvejot';

function zvejaEmojiString() {
  return (
    emoji('icon_udenszive') +
    emoji('icon_cope_1') +
    emoji('icon_cope_2') +
    emoji('icon_cope_3') +
    emoji('icon_cope_4') +
    emoji('icon_cope_5') +
    emoji('icon_udenszive')
  );
}

function tipsString({ selectedRod, usesLeft, caughtFishes, maxCapacity }: UserFishing) {
  const arr: string[] = [];

  if (!selectedRod) {
    arr.push('tu neesi izvēlējies makšķeri');
  } else if (!usesLeft) {
    arr.push('tev ir jāsalabo makšķere');
  }

  if (countFish(caughtFishes) >= maxCapacity) {
    arr.push('tev ir pilns copes inventārs');
  }

  return arr.length ? arr.map(a => `- ${a}\n`).join('') + '\u200B' : '';
}

export type ZvejotState = {
  user: UserProfile;
  selectedFishingRod: string | null;
  selectedFishingRodId: string | null;
};

function components(state: ZvejotState): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] {
  const { fishing, specialItems } = state.user;
  const { selectedRod, caughtFishes, usesLeft } = fishing;

  const collectFishButton = new ButtonBuilder()
    .setCustomId('collect_fish_btn')
    .setLabel('Savākt copi')
    .setStyle(ButtonStyle.Success)
    .setEmoji(emoji('icon_zive'));

  if (!selectedRod) {
    const rodsInInv = specialItems.filter(item => itemList[item.name].categories.includes(ItemCategory.MAKSKERE));
    if (!rodsInInv.length) {
      const btnRow = [
        new ButtonBuilder()
          .setCustomId('nuja')
          .setLabel('Tev nav nevienas makšķeres')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(true),
      ];

      if (caughtFishes && caughtFishes.length) btnRow.push(collectFishButton);

      return [new ActionRowBuilder<ButtonBuilder>().addComponents(btnRow)];
    }

    const btnRow = [
      new ButtonBuilder()
        .setCustomId('start_fishing_btn')
        .setLabel('Sākt zvejot')
        .setStyle(state.selectedFishingRodId ? ButtonStyle.Primary : ButtonStyle.Secondary)
        .setDisabled(!state.selectedFishingRodId),
    ];

    if (caughtFishes && Object.keys(caughtFishes).length) btnRow.push(collectFishButton);

    return [
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('select_fishing_rod')
          .setPlaceholder('Izvēlies makšķeri')
          .addOptions(
            rodsInInv
              .slice(0, 25)
              .sort((a, b) => {
                const itemA = itemList[a.name] as AttributeItem<ItemAttributes>;
                const itemB = itemList[b.name] as AttributeItem<ItemAttributes>;
                return itemB.customValue!(b.attributes) - itemA.customValue!(a.attributes);
              })
              .map(item => ({
                label: capitalizeFirst(itemList[item.name].nameNomVsk),
                value: `${item.name} ${item._id}`,
                emoji: itemList[item.name].emoji() ?? '❓',
                description: displayAttributes(item, true),
                default: state.selectedFishingRodId === item._id,
              })),
          ),
      ),
      new ActionRowBuilder<ButtonBuilder>().addComponents(...btnRow),
    ];
  }

  const buttons = [
    new ButtonBuilder()
      .setCustomId('remove_fishing_rod')
      .setLabel('Noņemt makšķeri')
      .setStyle(ButtonStyle.Secondary)
      .setEmoji(itemList[selectedRod].emoji() || '❓'),
  ];
  if (state.user.guildId === process.env.DEV_SERVER_ID) {
    buttons.push(
      new ButtonBuilder().setCustomId('refresh').setLabel('Atjaunot').setStyle(ButtonStyle.Secondary).setEmoji('🔄'),
    );
  }

  const { maxDurability, repairable } = maksekeresData[selectedRod];

  if (usesLeft < maxDurability) {
    buttons.unshift(
      new ButtonBuilder()
        .setCustomId('fix_fishing_rod')
        .setLabel(
          repairable
            ? `Salabot makšķeri (${latiString(calcRepairCost(selectedRod, usesLeft))})`
            : 'Šī makšķere nav salabojama',
        )
        .setStyle(repairable ? ButtonStyle.Primary : ButtonStyle.Danger)
        .setDisabled(!repairable)
        .setEmoji('🔧'),
    );
  }

  if (caughtFishes && Object.keys(caughtFishes).length) {
    buttons.unshift(collectFishButton);
  }

  const actionRows = [new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons)];

  return actionRows;
}

export default function zvejotView(state: ZvejotState, i: BaseInteraction) {
  const { fishing } = state.user;
  const { selectedRod, usesLeft, caughtFishes, lastCaughtFish, futureFishList, maxCapacity } = fishing;

  const fields = [
    {
      name: 'Izvēlētā makšķere',
      value: selectedRod
        ? `${itemString(itemList[selectedRod])} ${usesLeft}/${maksekeresData[selectedRod].maxDurability}`
        : '-',
      inline: false,
    },
    {
      name: 'Nākamais ķēriens',
      value:
        futureFishList && futureFishList.length
          ? `**${time(new Date(futureFishList[0].time), 't')}** ${time(new Date(futureFishList[0].time), 'd')}\n` +
            `Pēc ${millisToReadableTime(futureFishList[0].time - Date.now())}`
          : '-',
      inline: true,
    },
    {
      name: 'Pēdējais ķēriens',
      value: lastCaughtFish
        ? `**${time(new Date(lastCaughtFish.time), 't')}** ${time(new Date(lastCaughtFish.time), 'd')}\n` +
          `${itemString(itemList[lastCaughtFish.itemKey], 1)}`
        : '-',
      inline: true,
    },
    {
      name: '\u200B',
      value:
        `${zvejaEmojiString()} (${countFish(caughtFishes)}/${maxCapacity}) ` +
        (countFish(caughtFishes) >= maxCapacity ? underline(bold('PILNS')) : '') +
        (!caughtFishes || !Object.keys(caughtFishes).length ? '\n-\n\u200B' : ''),
      inline: false,
    },
  ];

  const tips = tipsString(state.user.fishing);

  if (tips)
    fields.unshift({
      name: '❗ Tu nevari zvejot, jo ❗',
      value: tips,
      inline: false,
    });

  if (caughtFishes && Object.keys(caughtFishes).length) {
    fields.push(
      ...Object.entries(caughtFishes).map(([key, amount]) => ({
        name: itemString(itemList[key], amount),
        value: `Vērtība: ${latiString(itemList[key].value)}`,
        inline: true,
      })),
    );
  }

  return embedTemplate({
    i,
    color: commandColors.zvejot,
    fields,
    components: components(state),
  });
}
