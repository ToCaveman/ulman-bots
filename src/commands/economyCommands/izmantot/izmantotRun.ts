import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ColorResolvable,
  ComponentType,
  EmbedField,
} from 'discord.js';
import findUser from '../../../economy/findUser';
import errorEmbed from '../../../embeds/errorEmbed';
import ephemeralReply from '../../../embeds/ephemeralReply';
import itemString from '../../../embeds/helpers/itemString';
import addItems from '../../../economy/addItems';
import embedTemplate from '../../../embeds/embedTemplate';
import ItemString from '../../../embeds/helpers/itemString';
import itemList from '../../../items/itemList';
import izmantotRunSpecial from './izmantotRunSpecial';
import { UsableItem } from '../../../interfaces/Item';
import intReply from '../../../utils/intReply';
import { Dialogs } from '../../../utils/Dialogs';

type State = {
  color: ColorResolvable;
  itemToUse: UsableItem;
  description: string;
  fields: EmbedField[];
  itemsToUseLeft: number;
};

function view(state: State, i: BaseInteraction) {
  const componentRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('izmantot_velreiz')
      .setLabel(`Izmantot vēlreiz (${state.itemsToUseLeft})`)
      .setStyle(ButtonStyle.Primary)
      .setEmoji(state.itemToUse.emoji() || '❓'),
  );

  return embedTemplate({
    i,
    color: state.color,
    title: `Izmantot: ${ItemString(state.itemToUse, null, true)}`,
    description: state.description,
    fields: state.fields,
    components:
      state.itemsToUseLeft && 'removedOnUse' in state.itemToUse && state.itemToUse.removedOnUse ? [componentRow] : [],
  });
}

export default async function izmantotRun(
  i: ChatInputCommandInteraction | ButtonInteraction,
  itemToUseKey: string,
  embedColor: number,
): Promise<any> {
  const userId = i.user.id;
  const guildId = i.guildId!;

  const user = await findUser(userId, guildId);
  if (!user) return intReply(i, errorEmbed);

  const { items, specialItems } = user;
  const itemToUse = itemList[itemToUseKey];

  if ('attributes' in itemToUse) {
    const specialItemsInInv = specialItems.filter(({ name }) => name === itemToUseKey);
    if (!specialItemsInInv.length) {
      return intReply(i, ephemeralReply(`Tavā inventārā nav **${itemString(itemToUse)}**`));
    }
    return izmantotRunSpecial(i, itemToUseKey, specialItemsInInv, embedColor);
  }

  const itemInInv = items.find(({ name }) => name === itemToUseKey);
  if (!itemInInv) {
    return intReply(i, ephemeralReply(`Tavā inventārā nav **${itemString(itemToUse)}**`));
  }

  if ('removedOnUse' in itemToUse && itemToUse.removedOnUse) {
    const resUser = await addItems(userId, guildId, { [itemToUseKey]: -1 });
    if (!resUser) return intReply(i, errorEmbed);
  }

  const itemsToUseLeft = itemInInv.amount - 1;

  const res = await (itemToUse as UsableItem).use(userId, guildId, itemToUseKey);

  if ('error' in res) return intReply(i, errorEmbed);
  if ('custom' in res) return res.custom(i, embedColor);

  const initialState: State = {
    color: (res.color || embedColor) as ColorResolvable,
    itemToUse: itemToUse as UsableItem,
    description: res.text,
    fields: res.fields || [],
    itemsToUseLeft,
  };

  const dialogs = new Dialogs(i, initialState, view, 'izmantot');

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  if (!itemsToUseLeft || ('removedOnUse' in itemToUse && !itemToUse.removedOnUse)) return;

  dialogs.onClick(async int => {
    if (int.customId === 'izmantot_velreiz' && int.componentType === ComponentType.Button) {
      izmantotRun(int, itemToUseKey, embedColor);
      return { end: true };
    }
  });
}
