//šis pavisam noteikti nebūs labs kods (ja salīdzina ar pārējo)
//praktiski visu šo šizofrēniju ir veidojis bumbotajs (ar "mazu" deimosa palīdzību)

import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  TextInputBuilder,
  TextInputStyle,
} from 'discord.js';
import addLati from '../../economy/addLati';
import editItemAttribute from '../../economy/editItemAttribute';
import findUser from '../../economy/findUser';
import buttonHandler from '../../embeds/buttonHandler';
import embedTemplate from '../../embeds/embedTemplate';
import ephemeralReply from '../../embeds/ephemeralReply';
import errorEmbed from '../../embeds/errorEmbed';
import itemString from '../../embeds/helpers/itemString';
import latiString from '../../embeds/helpers/latiString';
import smallEmbed from '../../embeds/smallEmbed';
import { UsableItemFunc, item } from '../../interfaces/Item';
import intReply from '../../utils/intReply';
import itemList, { ItemKey } from '../itemList';
import { MAX_LEVEL } from '../../levelingSystem/levelsList';
import millisToReadableTime from '../../embeds/helpers/millisToReadableTime';
import countFreeInvSlots from '../helpers/countFreeInvSlots';
import addItems from '../../economy/addItems';
import { SpecialItemInProfile } from '../../interfaces/UserProfile';

//ogu rekinasana
//no currTime atnemt lastUsed un tad dalīt ar augasnas laiku un tad floorosu
//tad laikam dabusu cik odzinas izaugusas...

// krumu vertibu generesana
// reizinataja intervals 0-1 ik pa 0.1
const MIN_LAIKS = 300_000; // 5 min
const MAX_LAIKS = 600_000; // 10 min

// maksimalais un minimalais ogu daudzums vienam krumam
const MIN_OGAS = 3;
const MAX_OGAS = 6;

// pasa ogu kruma augsanas ilgums (velak koda pieskaitu klat ogu augsanas ilgumu)
// 3_600_000 1h
const BAZES_KRUMA_AUGSANAS_LAIKS = 3_600_000; //1h

export function getRandomOga() {
  const ogas: ItemKey[] = ['mellene', 'avene', 'vinoga'];
  return ogas[Math.floor(Math.random() * ogas.length)];
}

export function getRandomGrowthTime() {
  // varbut nav efektivaaka metode, bet strada
  const randomInterval = Math.floor(Math.random() * 11); // generes no 0 - 10
  const result = randomInterval / 10; // izdalis genereto lai butu intervala no 0 - 1
  const skaitlis = (MAX_LAIKS - MIN_LAIKS) * result + MIN_LAIKS;
  return skaitlis;
}

export function getRandomMaxOgas() {
  const rand = Math.floor(Math.random() * (MAX_OGAS - MIN_OGAS + 1)) + MIN_OGAS;
  return rand;
}

export function dabutOguInfo({ attributes }: SpecialItemInProfile, currTime: number) {
  const lastUsed = attributes.lastUsed!;
  const laikaStarpiba = currTime - lastUsed;
  const sobridOgas = Math.floor(laikaStarpiba / attributes.growthTime!);
  //lastused + (sobridogas + 1) * growthtime - curtime
  // es isti nezinu ko sis viss nozime
  const cikNakamaOga = lastUsed + (sobridOgas + 1) * attributes.growthTime! - currTime;

  return { sobridOgas, cikNakamaOga };
}

export function dabutKrumaInfo({ attributes }: SpecialItemInProfile, currTime: number) {
  const augsanasLaiks = BAZES_KRUMA_AUGSANAS_LAIKS + attributes.growthTime!;
  const iestadits = attributes.iestadits!;
  const apliets = attributes.apliets!;
  const cikIlgiAug = currTime - iestadits; // testesanai
  const izaugsanasProg = Math.floor(((currTime - iestadits) / augsanasLaiks) * 100);

  //hmmmm sitais neizskatas parak labi
  // dievs lūdzu saki, ka šis strādā      - bumbotajs
  let izaudzis = false;
  currTime > iestadits + augsanasLaiks ? (izaudzis = true) : (izaudzis = false);

  return { izaudzis, cikIlgiAug, izaugsanasProg, augsanasLaiks };
}

const ogu_krums: UsableItemFunc = async (userId, guildId, _, specialItem) => {
  const currTime = Date.now();
  // stulba attributu siena
  const oguAgusanasIlgums = specialItem!.attributes.growthTime!;
  const lastUsed = specialItem!.attributes.lastUsed!;
  const ogasTips = specialItem!.attributes.berryType!;
  const iestadisanasLaiks = specialItem!.attributes.iestadits!;
  const krumaAugsanasLaiks = BAZES_KRUMA_AUGSANAS_LAIKS + oguAgusanasIlgums;

  const { cikNakamaOga, sobridOgas } = dabutOguInfo(specialItem!, currTime);
  const { izaugsanasProg } = dabutKrumaInfo(specialItem!, currTime);
  if (currTime < iestadisanasLaiks + krumaAugsanasLaiks) {
    return {
      text: 'Tavs ogu krūms vēl nav izaudzis!\n' + `Izaudzis: ${izaugsanasProg}`,
    };
  }
  if (sobridOgas < 1) {
    return {
      text: `Tavs ogu krūms vēl nav izaudzējis ogas...\n` + `Izaugs pēc \`${millisToReadableTime(cikNakamaOga)}\``,
    };
  }

  const cikOgasDot = Math.min(sobridOgas, specialItem!.attributes.maxBerries!);

  const user = await findUser(userId, guildId);
  if (!user) return { error: true };

  await editItemAttribute(userId, guildId, specialItem!._id!, {
    ...specialItem?.attributes,

    lastUsed:
      sobridOgas >= specialItem!.attributes.maxBerries! ? currTime : currTime - oguAgusanasIlgums + cikNakamaOga,
  });
  const userAfter = await addItems(userId, guildId, { [ogasTips]: cikOgasDot });
  if (!userAfter) return { error: true };
  const itemCount = userAfter.items.find(item => item.name === ogasTips)?.amount || 1;
  return {
    text: `Tu ievāci **${cikOgasDot}** ogas \n` + `Nākamā oga pēc \`${millisToReadableTime(cikNakamaOga)}\``,
    fields: [
      {
        name: 'Tu ievāci:',
        value: `${itemString(ogasTips, cikOgasDot, true)}`,
        inline: true,
      },
      {
        name: 'Tev tagad ir:',
        value: `${itemString(ogasTips, itemCount)}`,
        inline: true,
      },
    ],
  };
};

export default ogu_krums;
