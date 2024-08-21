import {
  ActionRowBuilder,
  BaseInteraction,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  time,
} from 'discord.js';
import addItems from '../../economy/addItems';
import editItemAttribute from '../../economy/editItemAttribute';
import findUser from '../../economy/findUser';
import commandColors from '../../embeds/commandColors';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import capitalizeFirst from '../../embeds/helpers/capitalizeFirst';
import itemString from '../../embeds/helpers/itemString';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import smallEmbed from '../../embeds/smallEmbed';
import { UsableItemFunc } from '../../interfaces/Item';
import UserProfile, { ItemAttributes, SpecialItemInProfile } from '../../interfaces/UserProfile';
import intReply from '../../utils/intReply';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import itemList, { ItemKey } from '../itemList';
import { Dialogs } from '../../utils/Dialogs';
import mongoTransaction from '../../utils/mongoTransaction';
import { useDifferentItemHandler, useDifferentItemSelectMenu } from '../../utils/useDifferentItem';

export const kakisFedState: {
  time: number;
  name: string;
}[] = [
  {
    time: 216_000_000, // 60h
    name: 'Aptaukojies 😎',
  },
  {
    time: 172_800_000, // 48h
    name: 'Pieēdies 😋',
  },
  {
    time: 129_600_000, // 36h
    name: 'Labi paēdis 😃',
  },
  {
    time: 86_400_000, // 24h
    name: 'Apmierināts 🙂',
  },
  {
    time: 43_200_000, // 12h
    name: 'Izsalcis 🥺',
  },
  {
    time: 0,
    name: 'ĻOTI IZSALCIS 😡',
  },
];

// kaķa maksimālais pabarošanas laiks, 3d
export const KAKIS_MAX_FEED = 259_200_000;

export const kakisFoodData: Record<ItemKey, { feedTimeMs: number }> = {
  lidaka: {
    feedTimeMs: 57_600_000, // 16h
  },
  asaris: {
    feedTimeMs: 72_000_000, // 20h
  },
  lasis: {
    feedTimeMs: 86_400_000, // 24h
  },
  kaku_bariba: {
    feedTimeMs: 129_600_000, // 36h
  },
};

export function foodDataPercentage(key: ItemKey) {
  return `(${Math.floor((kakisFoodData[key].feedTimeMs / KAKIS_MAX_FEED) * 100)}%)`;
}

function catFedPercentage(fedUntil: number, currTime: number) {
  return `${Math.round(((fedUntil - currTime) / KAKIS_MAX_FEED) * 100)}%`;
}

function deadTime(createdAt: number, fedUntil: number) {
  return (
    `**${time(new Date(createdAt), 't')}** ${time(new Date(createdAt), 'd')} **―** ` +
    `**${time(new Date(fedUntil), 't')}** ${time(new Date(fedUntil), 'd')}`
  );
}

type State = {
  user: UserProfile;
  itemId: string;
  attributes: ItemAttributes;
  currTime: number;
  selectedFood: ItemKey | null;
};

function view(state: State, i: BaseInteraction) {
  const { createdAt, fedUntil, hat } = state.attributes;
  const isDead = fedUntil! < state.currTime;

  const components: ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] = [];
  let buttonRow: ActionRowBuilder<ButtonBuilder> | null = null;

  const foodInInv = state.user.items
    .filter(({ name }) => Object.keys(kakisFoodData).includes(name))
    .sort(
      (a, b) => kakisFoodData[b.name].feedTimeMs / KAKIS_MAX_FEED - kakisFoodData[a.name].feedTimeMs / KAKIS_MAX_FEED,
    );

  if (!foodInInv.length && !buttonRow && !isDead) {
    buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Tev nav ar ko pabarot kaķi')
        .setCustomId('_')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true),
    );
  }

  if (catFedPercentage(fedUntil!, state.currTime) === '100%' && !buttonRow && !isDead) {
    buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel('Kaķis ir maksimāli piebarots')
        .setCustomId('_')
        .setStyle(ButtonStyle.Danger)
        .setDisabled(true),
    );
  }

  if (!isDead && !buttonRow) {
    components.push(
      new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('feed_cat_select')
          .setPlaceholder('Izvēlies ēdienu')
          .addOptions(
            foodInInv.map(({ name, amount }) => {
              // const { nameNomVsk, emoji } = itemList[name];
              return {
                label: `${capitalizeFirst(itemList[name].nameNomVsk)} ${foodDataPercentage(name)}`,
                description: `Tev ir ${amount}`,
                value: name,
                emoji: itemList[name].emoji() || '❓',
                default: name === state.selectedFood,
              };
            }),
          ),
      ),
    );

    buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel(`Pabarot kaķi`)
        .setCustomId('feed_cat_btn')
        .setStyle(state.selectedFood ? ButtonStyle.Success : ButtonStyle.Secondary)
        .setDisabled(!state.selectedFood),
    );
  }

  const nameTagInInv = state.user.items.find(({ name }) => name === 'kaka_parsaucejs');
  if (nameTagInInv) {
    const changeNameBtn = new ButtonBuilder()
      .setLabel('Mainīt kaķa vārdu')
      .setCustomId(`cat_change_name`)
      .setStyle(ButtonStyle.Primary)
      .setEmoji(itemList.kaka_parsaucejs.emoji() || '❓');

    if (buttonRow) buttonRow.addComponents(changeNameBtn);
    else buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(changeNameBtn);
  }

  const hatInInv = state.user.items.find(({ name }) => name === 'salaveca_cepure');

  if (hat || hatInInv) {
    const hatBtn = new ButtonBuilder()
      .setCustomId(hat ? 'cat_remove_hat' : 'cat_add_hat')
      .setLabel(hat ? 'Novilkt cepuri' : 'Uzvilkt cepuri')
      .setEmoji(itemList.salaveca_cepure.emoji() || '❓')
      .setStyle(ButtonStyle.Primary);

    if (buttonRow) buttonRow.addComponents(hatBtn);
    else buttonRow = new ActionRowBuilder<ButtonBuilder>().addComponents(hatBtn);
  }

  if (buttonRow) components.push(buttonRow);

  if (state.user.specialItems.filter(({ name }) => name === 'kakis').length > 1) {
    components.push(useDifferentItemSelectMenu(state.user, 'kakis', state.itemId));
  }

  return embedTemplate({
    i,
    color: commandColors.izmantot,
    title: `Izmantot: ${itemString(itemList.kakis, null, true, state.attributes)} ${isDead ? '(miris)' : ''}`,
    description: isDead
      ? `🪦 ${deadTime(createdAt!, fedUntil!)}`
      : `Vecums: **${millisToReadableTime(state.currTime - createdAt!)}**\n` +
        `Garastāvoklis: **${kakisFedState.find(s => fedUntil! - state.currTime > s.time)?.name}** ` +
        `(${catFedPercentage(fedUntil!, state.currTime)})`,
    components,
  });
}

async function handleCatModal(
  i: ModalSubmitInteraction,
  currTime: number,
): Promise<{ user: UserProfile; newItem: SpecialItemInProfile } | undefined> {
  const user = await findUser(i.user.id, i.guildId!);
  if (!user) {
    intReply(i, errorEmbed);
    return;
  }

  const nameTagInInv = user.items.find(({ name }) => name === 'kaka_parsaucejs');
  if (!nameTagInInv) {
    intReply(i, ephemeralReply(`Tavā inventārā nav **${itemString('kaka_parsaucejs')}**`));
    return;
  }

  const split = i.customId.split('_');
  const catId = split[split.length - 2];
  const modalCurrTime = +split[split.length - 1];

  if (modalCurrTime !== currTime) {
    return;
  }

  const newName = i.fields.getTextInputValue('cat_modal_input').trim();

  const catPrev = user.specialItems.find(item => item._id === catId);
  if (!catPrev) {
    intReply(i, errorEmbed);
    return;
  }

  if (newName === catPrev.attributes.customName) {
    intReply(i, ephemeralReply('Jaunajam kaķa vārdam ir jāatšķiras no vecā'));
    return;
  }

  // prettier-ignore
  const { ok, values } = await mongoTransaction(session => [
    () => editItemAttribute(i.user.id, i.guildId!, catId, { ...catPrev.attributes, customName: newName }, session),
    () => addItems(i.user.id, i.guildId!, { kaka_parsaucejs: -1 }, session),
  ]);

  if (!ok) {
    intReply(i, errorEmbed);
    return;
  }

  const { newItem, user: newUser } = values[0];

  intReply(
    i,
    smallEmbed(
      'Kaķa vārds veiksmīgi nomainīts\n' +
        `No: ${itemString('kakis', null, false, catPrev.attributes)}\n` +
        `Uz: **${itemString('kakis', null, false, newItem.attributes)}**`,
      0xffffff,
    ),
  );

  return { newItem, user: newUser };
}

const kakis: UsableItemFunc = async (userId, guildId, _, specialItem) => ({
  custom: async (i, color) => {
    const user = await findUser(userId, guildId);
    if (!user) return intReply(i, errorEmbed);

    const initialState: State = {
      user,
      itemId: specialItem!._id!,
      attributes: specialItem!.attributes,
      currTime: Date.now(),
      selectedFood: null,
    };

    const dialogs = new Dialogs(i, initialState, view, 'izmantot', { time: 60000 });

    if (!(await dialogs.start())) {
      return intReply(i, errorEmbed);
    }

    dialogs.onClick(async (int, state) => {
      const { customId, componentType } = int;

      const user = await findUser(userId, guildId);
      if (!user) return { error: true };

      const catInInv = user.specialItems.find(({ _id }) => _id === specialItem?._id);
      if (!catInInv) {
        intReply(int, ephemeralReply(`Šis kaķis vairs nav tavā inventārā`));
        return { end: true };
      }

      state.user = user;
      state.currTime = Date.now();
      state.attributes = catInInv.attributes;

      if (customId === 'use_different' && componentType === ComponentType.StringSelect) {
        return useDifferentItemHandler(user, 'kakis', int);
      }

      if (customId === 'feed_cat_select' && componentType === ComponentType.StringSelect) {
        state.selectedFood = user.items.find(({ name }) => name === int.values[0]) ? int.values[0] : null;
        return { update: true };
      }

      if (componentType !== ComponentType.Button) return;

      if (customId === 'feed_cat_btn') {
        if (!state.selectedFood) return { error: true };

        const hasFood = state.user.items.find(({ name }) => name === state.selectedFood);

        if (!hasFood) {
          intReply(int, ephemeralReply(`Tavā inventārā nav **${itemString(state.selectedFood)}**`));
          state.selectedFood = null;
          return { edit: true };
        }

        if (catInInv.attributes!.fedUntil! < state.currTime) {
          intReply(int, 'Tu nevari pabarot šo kaķi, jo tas tikko nomira :(');
          return { edit: true, end: true };
        }

        const { feedTimeMs } = kakisFoodData[state.selectedFood];
        const { fedUntil } = catInInv.attributes!;

        const newFedUntil = Math.min(state.currTime + KAKIS_MAX_FEED, feedTimeMs + fedUntil!);

        // prettier-ignore
        const { ok, values } = await mongoTransaction(session => [
          () => addItems(userId, guildId, { [state.selectedFood!]: -1 }, session),
          () => editItemAttribute(userId, guildId, catInInv._id!, { ...catInInv.attributes!, fedUntil: newFedUntil }, session),
        ]);

        if (!ok) return { error: true };

        const { newItem, user } = values[1];

        state.attributes = newItem.attributes;
        state.user = user;

        intReply(int, smallEmbed(`Tu pabaroji kaķi ar **${itemString(state.selectedFood, null, true)}**`, color));

        return {
          edit: true,
          after: () => {
            state.selectedFood = null;
          },
        };
      }

      if (customId === 'cat_change_name') {
        const nameTagInInv = user.items.find(({ name }) => name === 'kaka_parsaucejs');
        if (!nameTagInInv) {
          intReply(int, ephemeralReply(`Tavā inventārā nav **${itemString('kaka_parsaucejs')}**`));
          return { edit: true };
        }

        const modalId = `cat_modal_${specialItem!._id}_${state.currTime}`;

        await int.showModal(
          new ModalBuilder()
            .setCustomId(modalId)
            .setTitle('Mainīt kaķa nosaukumu')
            .addComponents(
              new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                new TextInputBuilder()
                  .setCustomId('cat_modal_input')
                  .setLabel('Jaunais nosaukums')
                  .setStyle(TextInputStyle.Short)
                  .setMinLength(1)
                  .setMaxLength(10),
              ),
            ),
        );

        try {
          const modalInt = await int.awaitModalSubmit({
            filter: i => i.customId == modalId,
            time: 50000,
          });

          const res = await handleCatModal(modalInt, state.currTime);
          if (!res) {
            return {};
          }

          state.user = res.user;
          state.attributes = res.newItem.attributes;
        } catch (_) {
          return {};
        }

        state.currTime = Date.now();

        return { edit: true };
      }

      // totāli nav kopēts kods no pētnieka
      if (customId === 'cat_add_hat') {
        if (!user.items.find(({ name }) => name === 'salaveca_cepure')) {
          intReply(int, ephemeralReply(`Tavā inventārā nav **${itemString('salaveca_cepure')}**`));
          return { edit: true };
        }

        // prettier-ignore
        const { ok, values } = await mongoTransaction(session => [
          () => addItems(userId, guildId, { salaveca_cepure: -1 }, session),
          () => editItemAttribute(userId, guildId, catInInv._id!, { ...catInInv.attributes, hat: 'salaveca_cepure', }, session)
        ]);

        if (!ok) {
          return { error: true };
        }

        const { user: userAfter, newItem } = values[1];

        state.user = userAfter;
        state.attributes = newItem.attributes;
        state.currTime = Date.now();

        intReply(int, smallEmbed(`Tu kaķim uzvilki **${itemString('salaveca_cepure', null, true)}**`, color));

        return { edit: true };
      }

      if (customId === 'cat_remove_hat') {
        if (catInInv.attributes.hat !== 'salaveca_cepure') {
          intReply(int, ephemeralReply('Kļūda, šim kaķim nav uzvilkta cepure'));
          return {};
        }

        if (!countFreeInvSlots(user)) {
          intReply(int, ephemeralReply('Tu nevari kaķim novilkt cepuri, jo tev nav brīvu vietu inventārā'));
          return {};
        }

        const { ok, values } = await mongoTransaction(session => [
          () => addItems(userId, guildId, { salaveca_cepure: 1 }, session),
          () => editItemAttribute(userId, guildId, catInInv._id!, { ...catInInv.attributes, hat: '' }, session),
        ]);

        if (!ok) return { error: true };

        const { user: userAfter, newItem } = values[1];

        state.user = userAfter;
        state.attributes = newItem.attributes;
        state.currTime = Date.now();

        // prettier-ignore
        intReply(int, smallEmbed(
          `Tu kaķim novilki **${itemString('salaveca_cepure', null, true)}**, ` +
          `un tā tika pievienota tavam inventāram`,
          color,
        ));

        return { edit: true };
      }
    });
  },
});

export default kakis;
