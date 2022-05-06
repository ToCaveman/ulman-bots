import Command from '../../interfaces/Command';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { CommandInteraction } from 'discord.js';
import findItemById from '../../items/findItemById';
import ephemeralReply from '../../embeds/ephemeralReply';
import findUser from '../../economy/findUser';
import errorEmbed from '../../embeds/errorEmbed';
import itemString from '../../embeds/stringFunctions/itemString';
import embedTemplate from '../../embeds/embedTemplate';
import addItems from '../../economy/addItems';

const iedot: Command = {
  title: 'Iedot',
  description: 'Iedot citam lietotājam kādu lietu',
  config: {
    name: 'iedot',
    description: 'Iedot citam lietotājam kādu lietu',
    options: [
      {
        name: 'lietotājs',
        description: 'Lietotājs kam iedot',
        type: ApplicationCommandOptionTypes.USER,
        required: true,
      }, {
        name: 'lietas_id',
        description: 'Lietas id',
        type: ApplicationCommandOptionTypes.STRING,
        required: true,
      }, {
        name: 'daudzums',
        description: 'Cik daudz dot',
        type: ApplicationCommandOptionTypes.INTEGER,
        min_value: 1,
        required: true,
      },
    ],
  },
  async run(i: CommandInteraction) {
    const target = i.options.data[0].user!;
    const itemToGiveId = i.options.data[1].value as string;
    const amount = i.options.data[2].value as number;

    if (target.id === i.user.id) {
      await i.reply(ephemeralReply('Tu nevari iedot sev'));
      return;
    }

    if (target.id === process.env.BOT_ID) {
      await i.reply(ephemeralReply('Tu nevari iedot Valsts bankai'));
      return;
    }

    const itemToGive = findItemById(itemToGiveId);
    if (!itemToGive) {
      await i.reply(ephemeralReply(`Šāda lieta neeksistē (nepareizi ievadīts id)`));
      return;
    }

    const user = await findUser(i.guildId!, i.user.id);

    if (!user) {
      await i.reply(errorEmbed);
      return;
    }

    const { items } = user;

    const itemInInv = items.find(({ name }) => name === itemToGive.key);
    if (!itemInInv) {
      await i.reply(ephemeralReply(`Tavā inventārā nav ${itemToGive.item.nameNomDsk}`));
      return;
    }

    if (itemInInv.amount < amount) {
      await i.reply(ephemeralReply(
        `Tavā inventārā nav ${itemString(itemToGive.item, amount)}\n` +
        `Tev ir tikai ${itemString(itemToGive.item, itemInInv.amount)}`,
      ));
      return;
    }

    const targetUser = await addItems(i.guildId!, target.id, { [itemToGive.key]: amount });
    const res = await addItems(i.guildId!, i.user.id, { [itemToGive.key]: -amount });

    if (!res || !targetUser) {
      await i.reply(errorEmbed);
      return;
    }

    const targetUserItem = targetUser.items.find(({ name }) => name === itemToGive.key)!;

    await i.reply(embedTemplate({
      i,
      content: `<@${target.id}>`,
      description: `Tu iedevi <@${target.id}> ${itemString(itemToGive.item, amount, true)}`,
      fields: [
        {
          name: 'Tev palika',
          value: itemString(itemToGive.item, itemInInv.amount - amount),
          inline: true,
        }, {
          name: 'Tagad viņam ir',
          value: itemString(itemToGive.item, targetUserItem.amount),
          inline: true,
        },
      ],
    }));

  },
};

export default iedot;