import { ActionRowBuilder, BaseInteraction, ButtonBuilder, ButtonStyle, EmbedField, User } from 'discord.js';
import UserProfile from '../../../interfaces/UserProfile';
import { INV_PAGE_SIZE, ItemType, itemTypes } from './inventars';
import latiString from '../../../embeds/helpers/latiString';
import embedTemplate from '../../../embeds/embedTemplate';
import userString from '../../../embeds/helpers/userString';
import commandColors from '../../../embeds/commandColors';
import btnPaginationRow from '../../../items/helpers/btnPaginationRow';
import itemList from '../../../items/itemList';

export type InventarsState = {
  targetDiscordUser: User;
  targetUser: UserProfile;
  fields: EmbedField[];
  currentPage: number;
  totalPages: number;
  itemTypesInInv: ItemType[];
  totalInvValue: number;
  itemCount: number;
  buttonsPressed: Set<'visas' | 'neizmantojamas'>;
};

function sellRow({ items }: UserProfile, buttonsPressed: Set<'visas' | 'neizmantojamas'>) {
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId('inv_pardot_visas')
      .setLabel('Pārdot visas mantas')
      .setStyle(buttonsPressed.has('visas') ? ButtonStyle.Success : ButtonStyle.Primary)
      .setDisabled(buttonsPressed.has('visas')),
  );

  const hasUnusableItems = items.find(item => !('use' in itemList[item.name]));
  if (hasUnusableItems) {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId('inv_pardot_neizmantojamas')
        .setLabel('Pārdot neizmantojamās mantas')
        .setStyle(buttonsPressed.has('neizmantojamas') ? ButtonStyle.Success : ButtonStyle.Primary)
        .setDisabled(buttonsPressed.has('neizmantojamas')),
    );
  }

  return row;
}

export function inventarsView(state: InventarsState, i: BaseInteraction) {
  const { items, specialItems, itemCap, userId } = state.targetUser;

  const fieldsToShow = state.fields.slice(state.currentPage * INV_PAGE_SIZE, (state.currentPage + 1) * INV_PAGE_SIZE);

  const rows: ActionRowBuilder<ButtonBuilder>[] = [];

  if (state.fields.length > INV_PAGE_SIZE) {
    rows.push(btnPaginationRow('inv', state.currentPage, state.totalPages));
  }

  if (
    userId === i.user.id &&
    (items.length || (specialItems.length && specialItems.find(({ name }) => !('notSellable' in itemList[name]))))
  ) {
    rows.push(sellRow(state.targetUser, state.buttonsPressed));
  }

  return embedTemplate({
    i,
    content: state.totalPages > 1 ? '\u200b' : undefined,
    title:
      state.targetUser.userId === i.user.id ? 'Tavs inventārs' : `${userString(state.targetDiscordUser)} inventārs`,
    description:
      items.length + specialItems.length
        ? `**${state.itemCount}** ` +
          (state.itemCount % 10 === 1 && state.itemCount % 100 !== 11 ? 'manta' : 'mantas') +
          ` no **${itemCap}**\n` +
          `Inventāra vērtība: ${latiString(state.totalInvValue, false, true)}\n\n` +
          state.itemTypesInInv.map(t => `-# ${itemTypes[t].emoji()} - ${itemTypes[t].textCompact}\n`).join('') +
          '\u2800'
        : 'Tev nav nevienas mantas (diezgan bēdīgi)\nIzmanto komandu `/palidziba`',
    color: commandColors.inventars,
    fields: fieldsToShow,
    components: rows,
  });
}
