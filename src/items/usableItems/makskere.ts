import { ActionRowBuilder, bold, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from 'discord.js';
import maksekeresData from '../../commands/economyCommands/zvejot/makskeresData';
import { calcRepairCost } from '../../commands/economyCommands/zvejot/zvejot';
import addLati from '../../economy/addLati';
import editItemAttribute from '../../economy/editItemAttribute';
import findUser from '../../economy/findUser';
import buttonHandler from '../../embeds/buttonHandler';
import commandColors from '../../embeds/commandColors';
import ephemeralReply from '../../embeds/ephemeralReply';
import capitalizeFirst from '../../embeds/helpers/capitalizeFirst';
import { displayAttributes } from '../../embeds/helpers/displayAttributes';
import itemString from '../../embeds/helpers/itemString';
import latiString from '../../embeds/helpers/latiString';
import smallEmbed from '../../embeds/smallEmbed';
import Item, { UsableItemFunc } from '../../interfaces/Item';
import itemList from '../itemList';

export function makskereCustomValue(itemKey: string): Item['customValue'] {
  return ({ durability }) => {
    const { value } = itemList[itemKey];
    const { maxDurability } = maksekeresData[itemKey];

    if (durability! <= 0) return 1;

    if (durability! < maxDurability) {
      return Math.floor((durability! / maxDurability) * value);
    }

    return value;
  };
}

const makskere: UsableItemFunc = async (userId, guildId, itemKey, specialItem) => {
  return {
    text: '',
    custom: async i => {
      const { attributes, _id } = specialItem!;

      const embed = new EmbedBuilder()
        .setDescription('Makšķeres ir izmantojamas zvejošanai\n' + 'Sāc zvejot ar komandu `/zvejot`')
        .setColor(commandColors.zvejot);

      const { maxDurability, repairable } = maksekeresData[itemKey];

      if (attributes.durability! >= maxDurability) {
        return i.reply({
          embeds: [
            embed.setDescription(
              (embed.data.description +=
                '\n\n💡 Ja makšķerei ir samazinājusies izturība, to var salabot ar šo pašu komandu')
            ),
          ],
        });
      }

      const repairCost = calcRepairCost(itemKey, attributes.durability!);
      const itemObj = itemList[itemKey];

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId('fix-fishing-rod-use-cmd')
          .setLabel(
            repairable
              ? `Salabot ${itemObj.nameAkuVsk} (${latiString(repairCost)})`
              : `${capitalizeFirst(itemObj.nameNomVsk)} nav salabojama`
          )
          .setStyle(repairable ? ButtonStyle.Primary : ButtonStyle.Danger)
          .setDisabled(!repairable)
          .setEmoji(itemObj.emoji || '❓')
      );

      const msg = await i.reply({ embeds: [embed], components: [row], fetchReply: true });

      await buttonHandler(i, 'izmantot', msg, async int => {
        if (int.customId !== 'fix-fishing-rod-use-cmd' || int.componentType !== ComponentType.Button) return;
        if (!repairable) return;

        const user = await findUser(userId, guildId);
        if (!user) return { error: true };

        const { lati, specialItems } = user;

        if (lati < repairCost) {
          int.reply(
            ephemeralReply(
              `Tev nepietiek nauda lai salabotu makšķeri - ${latiString(repairCost, false, true)}\n` +
                `Tev ir ${latiString(lati, false, true)}`
            )
          );
          return { end: true };
        }

        if (!specialItems.find(item => item._id === _id)) {
          int.reply(ephemeralReply('Inventāra saturs ir mainījies, šī makšķere vairs nav tavā inventārā'));
          return { end: true };
        }

        await addLati(userId, guildId, -repairCost);
        const userAfter = await editItemAttribute(userId, guildId, _id!, { durability: maxDurability });
        if (!userAfter) return;

        int.reply(
          smallEmbed(
            `Tu salaboji ${bold(itemString(itemObj, null, true))} - ${latiString(repairCost)}\n` +
              displayAttributes(userAfter.newItem),
            commandColors.zvejot
          )
        );
        return { end: true };
      });
    },
  };
};

export default makskere;
