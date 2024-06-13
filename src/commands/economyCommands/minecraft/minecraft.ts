import axios, { AxiosError, AxiosResponse } from 'axios';
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import addLati from '../../../economy/addLati';
import findUser from '../../../economy/findUser';
import buttonHandler from '../../../embeds/buttonHandler';
import embedTemplate from '../../../embeds/embedTemplate';
import ephemeralReply from '../../../embeds/ephemeralReply';
import errorEmbed from '../../../embeds/errorEmbed';
import Command from '../../../interfaces/Command';
import intReply from '../../../utils/intReply';
import mcPirktAutocomplete from './mcPirktAutocomplete';
import { MinecraftPrece, minecraftPreces } from './minecraftPreces';

const okddId = '797584379685240882';

function mcItemString(item: MinecraftPrece, amount: number, bold?: boolean): string {
  return `${amount}x ${item.emoji} ${bold ? '**' : ''}${item.name}${bold ? '**' : ''}`;
}

async function confirmPurchase(
  i: ChatInputCommandInteraction,
  mi: ModalSubmitInteraction,
  item: MinecraftPrece,
  amount: number
) {
  const username = mi.fields.getTextInputValue('username').trim();

  const embed = embedTemplate({
    i,
    title: '[Minecraft] Apstiprini pirkumu',
    description:
      `${mcItemString(item, amount, true)}\n` +
      `Cena: ${item.price * amount} lati\n\n` +
      `Lietotājvārds: **${username}**`,
    color: 0x00ff00,
  }).embeds!;

  const msg = await mi.reply({
    embeds: embed,
    components: [
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder().setCustomId('mc_pirkt_ja').setLabel('Pirkt').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('mc_pirkt_ne').setLabel('Atcelt').setStyle(ButtonStyle.Danger)
      ),
    ],

    fetchReply: true,
  });

  if (!msg) {
    return intReply(mi, errorEmbed);
  }

  buttonHandler(mi, 'mc-pirkt-confirm', msg, async int => {
    const { customId } = int;

    if (int.componentType !== ComponentType.Button) return;

    if (customId === 'mc_pirkt_ja') {
      const user = await findUser(i.user.id, i.guildId!);
      if (!user) {
        return { error: true };
      }

      if (user.lati < item.price * amount) {
        intReply(
          int,
          ephemeralReply(
            `Tev nepietiek naudas lai nopirktu ${mcItemString(item, amount, true)}\n` +
              `Cena: ${item.price * amount} lati\n` +
              `Tev ir ${user.lati} lati`
          )
        );
        return { end: true };
      }

      try {
        const res = await axios.post(
          'https://okdd.lv/api/give-item',
          { playerName: `${username}`, item: `minecraft:${item.itemId}`, quantity: amount },
          {
            headers: {
              Authorization: `Bearer ${process.env.MC_OKDD_API_TOKEN}`,
            },
          }
        );

        if (res.status !== 200 || res?.data?.success !== true) {
          intReply(
            int,
            ephemeralReply(
              'Neizdevās pievienot mantu norādītajam lietotājam. Pārliecinies, ka esi iekšā Minecraft serverī'
            )
          );
          return { end: true };
        }

        await addLati(i.user.id, i.guildId!, -item.price * amount);
      } catch (err) {
        if (err instanceof AxiosError) {
          if (err.response?.status === 400) {
            intReply(
              int,
              ephemeralReply(
                'Neizdevās pievienot mantu norādītajam lietotājam. Pārliecinies, ka esi iekšā Minecraft serverī'
              )
            );
            return { end: true };
          } else {
            intReply(int, ephemeralReply('OKDD API kļūda'));
            return { end: true };
          }
        }

        intReply(int, errorEmbed);
        return { end: true };
      }

      return {
        edit: {
          embeds: embedTemplate({
            i,
            title: '[Minecraft] Tu nopirki',
            description:
              `${mcItemString(item, amount, true)}\n` +
              `Cena: ${item.price * amount} lati\n\n` +
              `Lietotājvārds: **${username}**`,
            color: 0x00ff00,
          }).embeds!,
          components: [],
        },
        end: true,
      };
    } else if (customId === 'mc_pirkt_ne') {
      int.deferUpdate().catch(_ => _);
      return { end: true };
    }
  });
}

const minecraft: Command = {
  description: 'Pirkt Minecraft preces',
  data: {
    name: 'minecraft',
    description: 'Pirkt OKDD Minecraft servera mantas',
    options: [
      {
        name: 'veikals',
        description: 'Apskatīt nopērkamās minecraft mantas',
        type: ApplicationCommandOptionType.Subcommand,
      },
      {
        name: 'pirkt',
        description: 'Pirkt mantu minecraft serverī',
        type: ApplicationCommandOptionType.Subcommand,
        options: [
          {
            name: 'nosaukums',
            description: 'Mantas nosaukums',
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true,
          },
          {
            name: 'daudzums',
            description: 'Cik daudz mantas vēlies pārdot',
            type: ApplicationCommandOptionType.Integer,
            required: true,
            min_value: 1,
          },
        ],
      },
    ],
  },
  color: 0x00ff00,
  autocomplete: mcPirktAutocomplete,
  async run(i) {
    const userId = i.user.id;
    const guildId = i.guildId!;

    if (![okddId, process.env.DEV_SERVER_ID].includes(guildId)) {
      return intReply(
        i,
        ephemeralReply(
          '`/minecraft` komandu var izmantot tikai OkDraudziņDauni serverī\nUzaicinājums pieejams šeit: https://discord.gg/v6GfjaTSQE'
        )
      );
    }

    const subCommandName = i.options.getSubcommand();

    if (subCommandName === 'veikals') {
      return intReply(
        i,
        embedTemplate({
          i,
          title: '[Minecraft] Veikals',
          description:
            'Pirkt mantu: `/minecraft pirkt <nosaukums> <daudzums>`\n' +
            'Nopirktā mantas tiks pievienta tavam inventāram OKDD Minecraft serverī (mc.okdd.lv)',
          color: this.color,
          fields: minecraftPreces.map(prece => ({
            name: `${prece.emoji} ${prece.name}`,
            value: `Cena: ${prece.price} lati`,
            inline: false,
          })),
        })
      );
    } else if (subCommandName === 'pirkt') {
      const itemId = i.options.getString('nosaukums')!;
      const amount = i.options.getInteger('daudzums') || 1;

      if (!itemId || amount < 1) {
        return intReply(i, errorEmbed);
      }

      const item = minecraftPreces.find(itm => itm.itemId === itemId);
      if (!item) {
        return intReply(i, ephemeralReply('Izvēlies mantu no saraksta'));
      }

      let user = await findUser(userId, guildId);
      if (!user) {
        return intReply(i, errorEmbed);
      }

      const totalCost = item.price * amount;
      if (user.lati < totalCost) {
        return intReply(
          i,
          ephemeralReply(
            `Tev nepietiek naudas lai nopirktu ${mcItemString(item, amount, true)}\n` +
              `Cena: ${totalCost} lati\n` +
              `Tev ir ${user.lati} lati`
          )
        );
      }

      const currTime = Date.now();

      await i.showModal(
        new ModalBuilder()
          .setCustomId(`mc_pirkt_vards_${userId}_${currTime}`)
          .setTitle('Ievadi savu Minecraft lietotājvārdu')
          .addComponents(
            new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
              new TextInputBuilder()
                .setCustomId('username')
                .setLabel('Lietotājvārds')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(16)
            )
          )
      );

      i.awaitModalSubmit({
        filter: i => i.customId === `mc_pirkt_vards_${userId}_${currTime}`,
        time: 10_000,
      })
        .then(mi => confirmPurchase(i, mi, item, amount))
        .catch(_ => _);

      // return intReply(i, ephemeralReply('kaut kas nogāja galīgi greizi, kā tev šis izdevās?'));
    }
  },
};

export default minecraft;
