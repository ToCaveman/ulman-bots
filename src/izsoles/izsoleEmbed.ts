import { ActionRowBuilder, APIEmbed, ButtonBuilder, ButtonStyle, time } from 'discord.js';
import itemString from '../embeds/helpers/itemString';
import latiString from '../embeds/helpers/latiString';
import AuctionType from '../interfaces/AuctionType';
import itemList from '../items/itemList';
import emoji from '../utils/emoji';

export const ULMANBOTA_ROLE_ID = '905377993633955930';

export default function izsoleEmbed({
  _id,
  itemKey,
  startPrice,
  startDate,
  endDate,
  currentBid,
  bidHistory,
}: AuctionType) {
  const itemObj = itemList[itemKey];
  // const isActive = Date.now() > startDate && Date.now() < endDate;
  const isActive = true;

  const embeds: APIEmbed[] = [
    {
      title: `${isActive ? `${emoji('icon_check1')} Aktīva` : `${emoji('icon_cross')} Beigusies`} Izsole`,
      description:
        `Sākums: **${time(new Date(startDate), 't')}** ${time(new Date(startDate), 'd')}\n` +
        `Beigas: **${time(new Date(endDate), 't')}** ${time(new Date(endDate), 'd')}`,
      color: 0x9d2235,
      thumbnail: { url: itemObj.imgLink! },
      fields: [
        {
          name: `**${itemString(itemObj)}**`,
          value: '-',
        },
        {
          name: currentBid ? 'Augstākā likme' : 'Sākuma likme',
          value: currentBid ? `-` : latiString(startPrice),
        },
        {
          name: 'Likmju vēsture',
          value: bidHistory.length
            ? bidHistory
                .map(
                  ({ userTag, lati, date }) =>
                    `${time(new Date(date), 't')} ${userTag} - ${latiString(lati, false, true)}`
                )
                .join('\n')
            : '-',
        },
      ],
    },
  ];

  const btnCustomId = `izsole_perm_btn-${_id}-`;
  const currentPrice = currentBid?.lati || startPrice;

  const components = [
    new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setCustomId(`${btnCustomId}10-${currentPrice + 10}`)
        .setLabel(`Solīt +10 (${currentPrice + 10}) latus`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${btnCustomId}25-${currentPrice + 25}`)
        .setLabel(`Solīt +25 (${currentPrice + 25}) latus`)
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`${btnCustomId}custom`)
        .setLabel(`Solīt ar izvēlētu likmi`)
        .setStyle(ButtonStyle.Primary)
    ),
  ];

  return {
    content: `<@&${ULMANBOTA_ROLE_ID}>`,
    embeds,
    components: isActive ? components : [],
  };
}
