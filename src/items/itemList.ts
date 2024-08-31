/* eslint-disable func-names */
import Item, {
  AttributeItem,
  BaseItem,
  item,
  LotoItem,
  NotSellableItem,
  ShopItem,
  TirgusItem,
  UsableItem,
} from '../interfaces/Item';
import virve from './usableItems/virve';
import divainais_burkans from './usableItems/divainais_burkans';
import mugursoma, { INCREASE_CAP_1, INV_INCREASE_AMOUNT_1 } from './usableItems/mugursoma';
import latloto, { latlotoOptions } from './usableItems/latloto';
import dizloto, { dizlotoOptions } from './usableItems/dizloto';
import ogukrums, {
  getRandomApliesanasReizes,
  getRandomGrowthTime,
  getRandomMaxOgas,
  getRandomOga,
} from './usableItems/ogu_krums';
import kafija from './usableItems/kafija';
import kafijas_aparats, { kafijasAparatsUseMany } from './usableItems/kafijas_aparats';
import velo, { veloInfo } from './usableItems/velo';
import divaina_mugursoma, { INCREASE_CAP_2, INV_NCREASE_AMOUNT_2 } from './usableItems/divaina_mugursoma';
import petnieks, { getRandFreeSpin, petnieksUseMany } from './usableItems/petnieks';
import juridiska_zivs, { JURIDISKA_ZIVS_STATUS } from './usableItems/juridiska_zivs';
import maksekeresData from '../commands/economyCommands/zvejot/makskeresData';
import makskere, { makskereCustomValue } from './usableItems/makskere';
import naudas_maiss from './usableItems/naudas_maiss';
import brivgrieziens, { brivgriezInfo } from './usableItems/brivgrieziens';
import smilsu_pulkstenis, { ZVEJA_SHIFT_TIME } from './usableItems/smilsu_pulkstenis';
import nazis, { NAZIS_STATUS_TIME } from './usableItems/nazis';
import zemenu_rasens, { RASENS_STATUS_TIME } from './usableItems/zemenu_rasens';
import { statusList } from '../commands/economyCommands/profils';
import millisToReadableTime from '../embeds/helpers/millisToReadableTime';
import piena_spainis from './usableItems/piena_spainis';
import divaina_zivs from './usableItems/divaina_zivs';
import loto_zivs, { generateFishCount } from './usableItems/loto_zivs';
import petniekzivs, { PETNIEKZIVS_STATUS_TIME } from './usableItems/petniekzivs';
import kakis, { foodDataPercentage, kakisFedState, kakisFoodData, KAKIS_MAX_FEED } from './usableItems/kakis';
import itemString from '../embeds/helpers/itemString';
import piparkuka from './usableItems/piparkuka';
import nabagloto, { nabagLotoOptions } from './usableItems/nabagloto';
import ulmanloto, { ulmanlotoOptions } from './usableItems/ulmanloto';
import gazes_plits, { GazesPlitsActionType } from './usableItems/gazes_plits';
import ievarijums from './usableItems/ievarijums';
import oga, { BerryProperties, ogaInfo } from './usableItems/oga';
import kruma_sekla from './usableItems/kruma_sekla';
import emoji from '../utils/emoji';

export type ItemKey = string;

export type DiscountedItems = Record<ItemKey, number>;

export enum ItemCategory {
  ATKRITUMI,
  VEIKALS,
  ZIVIS,
  MAKSKERE,
  BRIVGRIEZIENS,
  TIRGUS,
  ADVENTE_2022,
  LOTO,
  OTHER,
}

const itemList: { [key: ItemKey]: Item } = {
  // -- veikals --
  // prettier-ignore
  koka_makskere: item<AttributeItem<{
    durability: number;
  }> & ShopItem>({

    info: 'Izcila maksķere iesācēju zvejotājiem - lēta un vienmēr pieejama.',
    addedInVersion: '4.0',
    nameNomVsk: 'koka makšķere',
    nameNomDsk: 'koka makšķeres',
    nameAkuVsk: 'koka makšķeri',
    nameAkuDsk: 'koka makšķeres',
    isVirsiesuDzimte: false,
    emoji: () => emoji('koka_makskere'),
    imgLink: 'https://www.ulmanbots.lv/images/items/kokamakskere.png',
    categories: [ItemCategory.VEIKALS, ItemCategory.MAKSKERE],
    value: 100,
    customValue: makskereCustomValue('koka_makskere'),
    attributes: () => ({
      durability: maksekeresData.koka_makskere.maxDurability,
    }),
    sortBy: { durability: 1 },
    allowDiscount: true,
    use: makskere,
  }),
  latloto: item<UsableItem & ShopItem & LotoItem>({
    info: 'Lētākā loterijas biļete kas nopērkama veikalā,\npārbaudi savu veiksmi jau šodien!',
    addedInVersion: '4.0',
    nameNomVsk: 'latLoto biļete',
    nameNomDsk: 'latLoto biļetes',
    nameAkuVsk: 'latLoto biļeti',
    nameAkuDsk: 'latLoto biļetes',
    isVirsiesuDzimte: false,
    emoji: () => emoji('latloto'),
    imgLink: 'https://www.ulmanbots.lv/images/items/latloto.png',
    categories: [ItemCategory.VEIKALS, ItemCategory.LOTO],
    value: 50,
    removedOnUse: false,
    lotoOptions: latlotoOptions,
    use: latloto,
  }),
  nazis: item<UsableItem & ShopItem>({
    info:
      'Ja jūties viltīgs un ar vēlmi zagt, tad nazis ir domāts tev.\n' +
      `Izmantojot nazi tu iegūsi **"${statusList.laupitajs}"** statusu uz ` +
      `\`${millisToReadableTime(NAZIS_STATUS_TIME)}\``,
    addedInVersion: '4.0',
    nameNomVsk: 'nazis',
    nameNomDsk: 'naži',
    nameAkuVsk: 'nazi',
    nameAkuDsk: 'nažus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('nazis'),
    imgLink: 'https://www.ulmanbots.lv/images/items/nazis.png',
    categories: [ItemCategory.VEIKALS],
    value: 125,
    removedOnUse: true,
    allowDiscount: true,
    use: nazis,
  }),
  virve: item<UsableItem & ShopItem>({
    info: 'Nopērc virvi, ja vienkārši vairs nevari izturēt...\nVirvi izmantot nav ieteicams.',
    addedInVersion: '4.0',
    nameNomVsk: 'virve',
    nameNomDsk: 'virves',
    nameAkuVsk: 'virvi',
    nameAkuDsk: 'virves',
    isVirsiesuDzimte: false,
    emoji: () => emoji('virve'),
    imgLink: 'https://www.ulmanbots.lv/images/items/virve.png',
    categories: [ItemCategory.VEIKALS],
    value: 10,
    allowDiscount: true,
    removedOnUse: true,
    use: virve,
  }),
  zemenu_rasens: item<UsableItem & ShopItem>({
    info:
      'Ja tev riebjas nolādētie zagļi kas visu laiku no tevis zog, izdzer zemeņu Rasēnu\n' +
      'Izdzerot (izmantojot) rasenu tu iegūsi ' +
      `**"${statusList.aizsargats}"** statusu uz \`${millisToReadableTime(RASENS_STATUS_TIME)}\``,
    addedInVersion: '4.0',
    nameNomVsk: 'zemeņu Rasēns',
    nameNomDsk: 'zemeņu Rasēni',
    nameAkuVsk: 'zemeņu Rasēnu',
    nameAkuDsk: 'zemeņu Rasēnus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('zemenu_rasens'),
    imgLink: 'https://www.ulmanbots.lv/images/items/zemenu_rasens.png',
    categories: [ItemCategory.VEIKALS],
    value: 75,
    allowDiscount: true,
    removedOnUse: true,
    use: zemenu_rasens,
  }),

  // prettier-ignore
  divainais_burkans: item<AttributeItem<{
    timesUsed: number;
    customName: string;
  }> & ShopItem>({

    info:
      'Šis burkāns ir ne tikai dīvains, bet arī garšīgs!\n' +
      'Burkānam piemīt atrībuts, kas uzskaita cik reizes tas ir bijis nokosts (izmantots)\n\n' +
      '_burkānam piemīt vēlviens atribūts, par kuru uzzinās tikai tie kas to ir nopirkuši_',
    addedInVersion: '4.0',
    nameNomVsk: 'dīvainais burkāns',
    nameNomDsk: 'dīvainie burkāni',
    nameAkuVsk: 'dīvaino burkānu',
    nameAkuDsk: 'dīvainos burkānus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('divainais_burkans'),
    imgLink: 'https://www.ulmanbots.lv/images/items/divainais_burkans.gif',
    categories: [ItemCategory.VEIKALS],
    value: 5000,
    // eslint-disable-next-line func-names
    customValue: function ({ customName }) {
      // humors
      if (customName!.toLowerCase().includes('seks')) return 6969;

      // pārbauda kirilicu
      if (/[а-яА-ЯЁё]/.test(customName!)) return 0;

      return this.value;
    },
    attributes: () => ({
      timesUsed: 0,
      customName: '',
    }),
    sortBy: { timesUsed: 1 },
    allowDiscount: true,
    use: divainais_burkans,
  }),
  dizloto: item<UsableItem & ShopItem & LotoItem>({
    info:
      'Ja tev ir apnicis skrāpēt LatLoto biļetes un vēlies palielināt savas likmes, ' +
      'tad pārbaudi savu veiksmi ar DižLoto jau šodien!\n',
    addedInVersion: '4.0',
    nameNomVsk: 'dižLoto biļete',
    nameNomDsk: 'dižLoto biļetes',
    nameAkuVsk: 'dižLoto biļeti',
    nameAkuDsk: 'dižLoto biļetes',
    isVirsiesuDzimte: false,
    emoji: () => emoji('dizloto'),
    imgLink: 'https://www.ulmanbots.lv/images/items/dizloto.gif',
    categories: [ItemCategory.VEIKALS, ItemCategory.LOTO],
    value: 250,
    removedOnUse: false,
    lotoOptions: dizlotoOptions,
    use: dizloto,
  }),

  // prettier-ignore
  divaina_makskere: item<AttributeItem<{
    durability: number;
  }> & ShopItem>({

    info:
      'Koka makšķere ir pārāk lēna?\nTā pārāk bieži lūzt?\nNenes pietiekami lielu pelņu?\n' +
      'Tad ir laiks investēt dīvainajā maksķerē!!!',
    addedInVersion: '4.0',
    nameNomVsk: 'dīvainā makšķere',
    nameNomDsk: 'dīvainās makšķeres',
    nameAkuVsk: 'dīvaino makšķeri',
    nameAkuDsk: 'dīvainās makšķeres',
    isVirsiesuDzimte: false,
    emoji: () => emoji('divaina_makskere'),
    imgLink: 'https://www.ulmanbots.lv/images/items/divaina_makskere.gif',
    categories: [ItemCategory.VEIKALS, ItemCategory.MAKSKERE],
    value: 450,
    customValue: makskereCustomValue('divaina_makskere'),
    attributes: () => ({
      durability: maksekeresData.divaina_makskere.maxDurability,
    }),
    sortBy: { durability: 1 },
    allowDiscount: true,
    use: makskere,
  }),
  mugursoma: item<UsableItem & ShopItem>({
    info:
      'Inventārs pilns, ||bikses pilnas,|| ko tagad darīt?\n' +
      `Mugursoma palielinās tava inventāra ietilpību par **${INV_INCREASE_AMOUNT_1}** (līdz **${INCREASE_CAP_1}** vietām)`,
    addedInVersion: '4.0',
    nameNomVsk: 'mugursoma',
    nameNomDsk: 'mugursomas',
    nameAkuVsk: 'mugursomu',
    nameAkuDsk: 'mugursomas',
    isVirsiesuDzimte: false,
    emoji: () => emoji('mugursoma'),
    imgLink: 'https://www.ulmanbots.lv/images/items/mugursoma.png',
    categories: [ItemCategory.VEIKALS],
    value: 175,
    allowDiscount: true,
    removedOnUse: false,
    use: mugursoma,
  }),
  piena_spainis: item<UsableItem & ShopItem>({
    info: 'Izdzerot (izmantojot) šo gardo piena spaini tev tiks noņemti visi statusi',
    addedInVersion: '4.0',
    nameNomVsk: 'piena spainis',
    nameNomDsk: 'piena spaiņi',
    nameAkuVsk: 'piena spaini',
    nameAkuDsk: 'piena spaiņus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('piena_spainis'),
    imgLink: 'https://www.ulmanbots.lv/images/items/piena_spainis.png',
    categories: [ItemCategory.VEIKALS],
    value: 25,
    allowDiscount: true,
    removedOnUse: false,
    use: piena_spainis,
  }),
  // XD smieklīgs nosaukums
  kaku_bariba: item<UsableItem & ShopItem>({
    info: () =>
      `Iecienītas brokastis, pusdienas un vakariņas (kaķim)\n` +
      // @ts-ignore
      `Ar kaķu barību var pabarot **${itemString('kakis', null, true)}**`,
    addedInVersion: '4.1',
    nameNomVsk: 'kaķu barība',
    nameNomDsk: 'kaķu barības',
    nameAkuVsk: 'kaķu barību',
    nameAkuDsk: 'kaķu barības',
    isVirsiesuDzimte: false,
    emoji: () => emoji('kaku_bariba'),
    imgLink: 'https://www.ulmanbots.lv/images/items/kaku_bariba.png',
    categories: [ItemCategory.VEIKALS],
    value: 20,
    allowDiscount: true,
    removedOnUse: false,
    use: () => ({
      text:
        `Tu pagaršoji kaķu barību (tā nebija garšīga)\n` +
        // @ts-ignore
        `Ar kaķu barību var pabarot **${itemString('kakis', null, true)}**`,
    }),
  }),

  // -- tirgus --
  divaina_mugursoma: item<UsableItem & TirgusItem>({
    info:
      `Tu esi izmantojis parastās mugursomas un sasniedzis ${INCREASE_CAP_1} vietas inventārā\n` +
      `Ar dīvaino mugursomu tu vari palielināt inventāra iepilpību par **${INV_NCREASE_AMOUNT_2}** (līdz **${INCREASE_CAP_2}** vietām)`,
    addedInVersion: '4.0',
    nameNomVsk: 'dīvainā mugursoma',
    nameNomDsk: 'dīvainās mugursomas',
    nameAkuVsk: 'dīvaino mugursomu',
    nameAkuDsk: 'dīvainās mugursomas',
    isVirsiesuDzimte: false,
    emoji: () => emoji('divaina_mugursoma'),
    imgLink: 'https://www.ulmanbots.lv/images/items/divaina_mugursoma.gif',
    categories: [ItemCategory.TIRGUS],
    tirgusPrice: { items: { mugursoma: 3 } },
    value: 500,
    removedOnUse: false,
    use: divaina_mugursoma,
  }),

  // prettier-ignore
  kafijas_aparats: item<AttributeItem<{
    lastUsed: number;
  }> & TirgusItem>({

    info:
      `Kafijas aparāts ik \`24h\` uztaisīs kafiju, kuru var iegūt kafijas aparātu izmantojot\n\n` +
      '_Nevienam vēljoprojām nav zināms kā šis kafijas aparāts ir spējīgs bezgalīgi taisīt kafiju bez pupiņām, vai ūdens, vai ... elektrības_',
    addedInVersion: '4.0',
    nameNomVsk: 'kafijas aparāts',
    nameNomDsk: 'kafijas aparāti',
    nameAkuVsk: 'kafijas aparātu',
    nameAkuDsk: 'kafijas aparātus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('kafijas_aparats'),
    imgLink: 'https://www.ulmanbots.lv/images/items/kafijas_aparats.png',
    categories: [ItemCategory.TIRGUS],
    value: 200,
    tirgusPrice: { items: { kafija: 15, metalluznis: 3 } },
    attributes: (): {
      lastUsed: number;
    } => ({
      lastUsed: 0,
    }),
    sortBy: { lastUsed: -1 },
    use: kafijas_aparats,
    useMany: kafijasAparatsUseMany,
  }),
  // prettier-ignore
  petnieks: item<AttributeItem<{
    lastUsed: number;
    foundItemKey: string;
    hat: string;
  }> & TirgusItem>({

    info:
      `Pētnieks vēlās kļūt par tavu labāko draugu!\n` +
      `Viņš ir tik draudzīgs, ka pētīs krievu mājaslapas lai **tev** atrastu brīvgriezienus\n\n` +
      'Pētnieks atrod vienu brīvgriezienu ik `12h`, kuru tu vari saņemt pētnieku "izmantojot"',
    addedInVersion: '4.0',
    nameNomVsk: 'pētnieks',
    nameNomDsk: 'pētnieki',
    nameAkuVsk: 'pētnieku',
    nameAkuDsk: 'pētniekus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('petnieks'),
    customEmoji: function ({ hat }) {
      if (hat === 'salaveca_cepure') {
        return emoji('petnieks_zsv');
      }

      return this.emoji();
    },
    imgLink: 'https://www.ulmanbots.lv/images/items/petnieks.png',
    categories: [ItemCategory.TIRGUS],
    value: 300,
    tirgusPrice: { items: { brivgriez25: 6, brivgriez50: 4, brivgriez100: 2 }, lati: 750 },
    attributes: () => ({
      lastUsed: 0,
      foundItemKey: getRandFreeSpin(),
      hat: '',
    }),
    sortBy: { lastUsed: -1 },
    use: petnieks,
    useMany: petnieksUseMany,
  }),
  // prettier-ignore
  loto_makskere: item<AttributeItem<{
    durability: number;
  }> & TirgusItem>({

    info:
      'Šī makšķere ir īpaši veidota tieši azartspēļu atkarības cietušajiem\n' +
      'Iegādājies to, ja nevari atturēties no aparāta un loto biļetēm',
    addedInVersion: '4.0',
    nameNomVsk: 'loto makšķere',
    nameNomDsk: 'loto makšķeres',
    nameAkuVsk: 'loto makšķeri',
    nameAkuDsk: 'loto makšķeres',
    isVirsiesuDzimte: false,
    emoji: () => emoji('loto_makskere'),
    imgLink: 'https://www.ulmanbots.lv/images/items/loto_makskere.gif',
    categories: [ItemCategory.TIRGUS, ItemCategory.MAKSKERE],
    value: 500,
    customValue: makskereCustomValue('loto_makskere'),
    tirgusPrice: { items: { latloto: 3, dizloto: 2, brivgriez25: 2, brivgriez50: 1 } },
    attributes: () => ({
      durability: maksekeresData.loto_makskere.maxDurability,
    }),
    sortBy: { durability: 1 },
    use: makskere,
  }),
  // prettier-ignore
  luznu_makskere: item<AttributeItem<{
    durability: number;
  }> & TirgusItem>({

    info:
      'Ja mīlēsi metāllūžņus, tie visnotaļ mīlēs arī tevi!\n' +
      'Par cik šī makšķere knapi turās kopā, to nav iespējams salabot',
    addedInVersion: '4.0',
    nameNomVsk: 'lūžņu makšķere',
    nameNomDsk: 'lūžņu makšķeres',
    nameAkuVsk: 'lūžņu makšķeri',
    nameAkuDsk: 'lūžņu makšķeres',
    isVirsiesuDzimte: false,
    emoji: () => emoji('luznu_makskere'),
    imgLink: 'https://www.ulmanbots.lv/images/items/luznu_makskere.png',
    categories: [ItemCategory.TIRGUS, ItemCategory.MAKSKERE],
    value: 100,
    customValue: makskereCustomValue('luznu_makskere'),
    tirgusPrice: { items: { metalluznis: 15 } },
    attributes: () => ({
      durability: maksekeresData.luznu_makskere.maxDurability,
    }),
    sortBy: { durability: 1 },
    use: makskere,
  }),

  // prettier-ignore
  naudas_maiss: item<AttributeItem<{
    latiCollected: number;
  }> & TirgusItem>({

    info:
      'Kļūt par bankas zagli ir viegli, bet kur liksi nolaupīto naudu?\n\n' +
      'Naudas maiss glabā no Valsts Bankas (UlmaņBota) nozagto naudu, ' +
      'un lai zagtu no bankas inventārā ir jābūt vismaz vienam **tukšam** naudas maisam',
    addedInVersion: '4.0',
    nameNomVsk: 'naudas maiss',
    nameNomDsk: 'naudas maisi',
    nameAkuVsk: 'naudas maisu',
    nameAkuDsk: 'naudas maisus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('naudas_maiss'),
    imgLink: 'https://www.ulmanbots.lv/images/items/naudas_maiss.png',
    categories: [ItemCategory.TIRGUS],
    value: 10,
    // eslint-disable-next-line func-names
    customValue: function ({ latiCollected }) {
      return latiCollected || this.value;
    },
    tirgusPrice: { items: { nazis: 1, zemenu_rasens: 1, juridiska_zivs: 1, divaina_zivs: 1 } },
    attributes: () => ({
      latiCollected: 0,
    }),
    sortBy: { latiCollected: 1 },
    use: naudas_maiss,
  }),

  // prettier-ignore
  kakis: item<AttributeItem<{
    customName: string;
    createdAt: number;
    fedUntil: number;
    isCooked: boolean;
    hat: string;
  }> & TirgusItem>({

    info: () =>
      '**Pūkains, stilīgs un episks!**\n\n' +
      `Kaķim ir 2 atribūti - vecums un garastāvoklis\n` +
      `Kaķis ir jābaro citādāk tas nomirs\n\n` +
      '__Kaķim ir 6 garastāvokļi:__ \n' +
      kakisFedState
        .map(({ time, name }) => `• **${name}** (${Math.floor((time / KAKIS_MAX_FEED) * 100)}%)`)
        .join('\n') +
      `\n\nKaķa garastāvoklis tiek mērīts procentos (100% ir **\`${millisToReadableTime(KAKIS_MAX_FEED)}\`**) ` +
      `un ar laiku tas samazināsies, kad tiek sasniegti 0% kaķis **NOMIRS**\n\n` +
      `Lai uzlabotu kaķa garastāvokli tas ir jābaro, to var izdarīt kaķi "izmantojot"\n\n` +
      '__Kaķi ir iespājms pabarot ar šīm mantām:__\n' +
      Object.entries(kakisFoodData)
        .sort(([, a], [, b]) => b.feedTimeMs - a.feedTimeMs)
        .map(([key]) => `**${itemString(key)}** ${foodDataPercentage(key)}`)
        .join('\n') +
      '\n\n_**Paldies Ričardam par šo izcilo kaķa bildi (viņu sauc Sāra)**_',
    addedInVersion: '4.1',
    nameNomVsk: 'kaķis',
    nameNomDsk: 'kaķi',
    nameAkuVsk: 'kaķi',
    nameAkuDsk: 'kaķus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('kakis'),
    customEmoji: function ({ hat }) {
      if (hat === 'salaveca_cepure') {
        return emoji('kakis_zsv');
      }

      return this.emoji();
    },
    imgLink: 'https://www.ulmanbots.lv/images/items/kakis.png',
    categories: [ItemCategory.TIRGUS],
    value: 100,
    customValue: function ({ fedUntil, createdAt }) {
      const currTime = Date.now();
      if (fedUntil < Date.now()) return 0;

      // katra pilna diena dod +15 latus vērtībai
      return this.value + 15 * Math.floor((currTime - createdAt) / 86_400_000);
    },
    tirgusPrice: { items: { lidaka: 3, asaris: 3, lasis: 3 } },
    attributes: (currTime) => ({
      customName: '',
      createdAt: currTime,
      fedUntil: currTime + 172_800_000, // 2d
      isCooked: false,
      hat: '',
    }),
    sortBy: { createdAt: -1 },
    use: kakis,
  }),

  // prettier-ignore
  gazes_plits: item<AttributeItem<{
    actionType: GazesPlitsActionType;
    boilIevarijums?: {
      boilStarttime: number;
      boilDuration: number;
      berries: Record<ItemKey, number>;
      properties: BerryProperties;
    };
  }> & TirgusItem>({
    info: '', // TODO 
    addedInVersion: '4.3',
    nameNomVsk: 'gāzes plīts',
    nameNomDsk: 'gāzes plītis',
    nameAkuVsk: 'gāzes plīti',
    nameAkuDsk: 'gāzes plītis',
    isVirsiesuDzimte: false,
    emoji: () => emoji('gazes_plits'),
    imgLink: null,
    categories: [ItemCategory.TIRGUS],
    value: 50,
    tirgusPrice: { items: { metalluznis: 10 } },
    attributes: () => ({
      actionType: ''
    }),
    sortBy: { actionType: -1 },
    use: gazes_plits,
  }),

  // -- atkritumi --

  //hmmmm... šitā iespējams būs vajadzīgā, kā izmantojama manta, bet tas vēlēkam
  akumulators: item<BaseItem>({
    info: 'MmMMmmm, tas šķidrums izskatās ļoti garšīgs\n' + 'ļoti noslēpumaina manta',
    addedInVersion: '4.3',
    nameNomVsk: 'akumulators',
    nameNomDsk: 'akumulatori',
    nameAkuVsk: 'akumulatoru',
    nameAkuDsk: 'akumulatorus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('akumulators'),
    imgLink: 'https://beanson.lv/images/akumulators.png',
    categories: [ItemCategory.ATKRITUMI],
    value: 20,
  }),
  kartona_kaste: item<BaseItem>({
    info: 'Kāds šeit iekšā ir dzīvojis...',
    addedInVersion: '4.0',
    nameNomVsk: 'kartona kaste',
    nameNomDsk: 'kartona kastes',
    nameAkuVsk: 'kartona kasti',
    nameAkuDsk: 'kartona kastes',
    isVirsiesuDzimte: false,
    emoji: () => emoji('kartona_kaste'),
    imgLink: 'https://www.ulmanbots.lv/images/items/kartona_kaste.png',
    categories: [ItemCategory.ATKRITUMI],
    value: 15,
  }),
  pudele: item<BaseItem>({
    info:
      'Šī tik tiešām ir skaista pudele kuru varētu nodot depozīta sistēmā!\n' +
      'Cik žēl, ka taromāts šajā UlmaņBota versijā neeksistē... :^)',
    addedInVersion: '4.0',
    nameNomVsk: 'stikla pudele',
    nameNomDsk: 'stikla pudeles',
    nameAkuVsk: 'stikla pudeli',
    nameAkuDsk: 'stikla pudeles',
    isVirsiesuDzimte: false,
    emoji: () => emoji('pudele'),
    imgLink: 'https://www.ulmanbots.lv/images/items/pudele.png',
    categories: [ItemCategory.ATKRITUMI],
    value: 10,
  }),
  metalluznis: item<UsableItem>({
    info:
      'Vai tu esi redzējis skaistāku metāla gabalu par šo?!?!??!!\n\n' +
      'Metāllūžņi ir iekļauti dažās tirgus preču cenās, apdomā vai tik tiešām vēlies tos pārdot',
    addedInVersion: '4.0',
    nameNomVsk: 'metāllūznis',
    nameNomDsk: 'metāllūžņi',
    nameAkuVsk: 'metāllūzni',
    nameAkuDsk: 'metāllūžņus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('metalluznis'),
    imgLink: 'https://www.ulmanbots.lv/images/items/metalluznis.png',
    categories: [ItemCategory.ATKRITUMI],
    value: 10,
    removedOnUse: false,
    use: async () => ({ text: 'Metāllūznis ir izmantojams lai nopirktu dažas tirgus preces' }),
  }),

  // -- zivis --
  lidaka: item<BaseItem>({
    info: 'Uz šo zivi skatīties nav ieteicams kamēr esi darbā...',
    addedInVersion: '4.0',
    nameNomVsk: 'līdaka',
    nameNomDsk: 'līdakas',
    nameAkuVsk: 'līdaku',
    nameAkuDsk: 'līdakas',
    isVirsiesuDzimte: false,
    emoji: () => emoji('lidaka'),
    imgLink: 'https://www.ulmanbots.lv/images/items/lidaka.png',
    categories: [ItemCategory.ZIVIS],
    value: 10,
  }),
  cepta_lidaka: item<BaseItem>({
    info: () =>
      'mmm... pusdienas\n\n' +
      `Šo zivi var iegūt izcepjot **${itemString('lidaka', null, true)}** ` +
      `ar **${itemString('gazes_plits', null, true)}**`,
    addedInVersion: '4.3',
    nameNomVsk: 'cepta līdaka',
    nameNomDsk: 'ceptas līdakas',
    nameAkuVsk: 'ceptu līdaku',
    nameAkuDsk: 'ceptas līdakas',
    isVirsiesuDzimte: false,
    emoji: () => emoji('cepta_lidaka'),
    imgLink: null,
    categories: [ItemCategory.ZIVIS],
    value: 50,
  }),
  asaris: item<BaseItem>({
    info: 'Šī zivs novedīs tevi līdz asarām',
    addedInVersion: '4.0',
    nameNomVsk: 'asaris',
    nameNomDsk: 'asari',
    nameAkuVsk: 'asari',
    nameAkuDsk: 'asarus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('asaris'),
    imgLink: 'https://www.ulmanbots.lv/images/items/asaris.png',
    categories: [ItemCategory.ZIVIS],
    value: 15,
  }),
  cepts_asaris: item<BaseItem>({
    info: () =>
      'mmm... pusdienas\n\n' +
      `Šo zivi var iegūt izcepjot **${itemString('asaris', null, true)}** ` +
      `ar **${itemString('gazes_plits', null, true)}**`,
    addedInVersion: '4.3',
    nameNomVsk: 'cepts asaris',
    nameNomDsk: 'cepti asari',
    nameAkuVsk: 'ceptu asari',
    nameAkuDsk: 'ceptus asarus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('cepts_asaris'),
    imgLink: null,
    categories: [ItemCategory.ZIVIS],
    value: 75,
  }),
  lasis: item<BaseItem>({
    info: 'Tu labprāt šo zivi apēstu, bet nejaukais Discord čatbots tev to neļauj darīt',
    addedInVersion: '4.0',
    nameNomVsk: 'lasis',
    nameNomDsk: 'laši',
    nameAkuVsk: 'lasi',
    nameAkuDsk: 'lašus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('lasis'),
    imgLink: 'https://www.ulmanbots.lv/images/items/lasis.png',
    categories: [ItemCategory.ZIVIS],
    value: 20,
  }),
  cepts_lasis: item<BaseItem>({
    info: () =>
      'mmm... pusdienas\n\n' +
      `Šo zivi var iegūt izcepjot **${itemString('lasis', null, true)}** ` +
      `ar **${itemString('gazes_plits', null, true)}**`,
    addedInVersion: '4.3',
    nameNomVsk: 'cepts lasis',
    nameNomDsk: 'cepti laši',
    nameAkuVsk: 'ceptu lasi',
    nameAkuDsk: 'ceptus lašus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('cepts_lasis'),
    imgLink: null,
    categories: [ItemCategory.ZIVIS],
    value: 100,
  }),

  // prettier-ignore
  loto_zivs: item<AttributeItem<{
    holdsFishCount: number,
  }>>({

    info:
      'Uzgriez loto zivi un kā laimestu saņem... zivis\n' +
      'Loto zivij piemīt atribūts "Satur **x** zivis", kas nosaka cik zivis no loto zivs ir iespējams laimēt',
    addedInVersion: '4.1',
    nameNomVsk: 'loto zivs',
    nameNomDsk: 'loto zivis',
    nameAkuVsk: 'loto zivi',
    nameAkuDsk: 'loto zivis',
    isVirsiesuDzimte: false,
    emoji: () => emoji('loto_zivs'),
    imgLink: 'https://www.ulmanbots.lv/images/items/loto_zivs.gif',
    categories: [ItemCategory.ZIVIS],
    value: 0,
    customValue: ({ holdsFishCount }) => holdsFishCount! * 10,
    attributes: () => ({
      holdsFishCount: generateFishCount(),
    }),
    sortBy: { holdsFishCount: 1 },
    use: loto_zivs,
  }),
  juridiska_zivs: item<UsableItem>({
    info:
      'Šai zivij pieder vairāki multimiljonu uzņēmumi\n\n' +
      `Apēdot (izmantojot) juridisko zivi tu iegūsi ` +
      `**"${statusList.juridisks}"** statusu uz \`${millisToReadableTime(JURIDISKA_ZIVS_STATUS)}\`, ` +
      `kas tevi atvieglos no iedošanas un maksāšanas nodokļa\n\n` +
      '_Tikai neapēd šīs zivs dārgo uzvalku_',
    addedInVersion: '4.0',
    nameNomVsk: 'juridiskā zivs',
    nameNomDsk: 'juridiskās zivis',
    nameAkuVsk: 'juridisko zivi',
    nameAkuDsk: 'juridiskās zivis',
    isVirsiesuDzimte: false,
    emoji: () => emoji('juridiska_zivs'),
    imgLink: 'https://www.ulmanbots.lv/images/items/juridiska_zivs.png',
    categories: [ItemCategory.ZIVIS],
    value: 50,
    removedOnUse: true,
    use: juridiska_zivs,
  }),
  divaina_zivs: item<UsableItem>({
    info: 'Šī zivs garšo nedaudz _dīvaini_, apēd (izmanto) to lai iegūtu vienu nejauši izvēlētu statusu',
    addedInVersion: '4.0',
    nameNomVsk: 'dīvainā zivs',
    nameNomDsk: 'dīvainās zivis',
    nameAkuVsk: 'dīvaino zivi',
    nameAkuDsk: 'dīvainās zivis',
    isVirsiesuDzimte: false,
    emoji: () => emoji('divaina_zivs'),
    imgLink: 'https://www.ulmanbots.lv/images/items/divaina_zivs.gif',
    categories: [ItemCategory.ZIVIS],
    value: 60,
    removedOnUse: true,
    use: divaina_zivs,
  }),
  petniekzivs: item<UsableItem>({
    info:
      '__**Šodien paveiksies!**__\n\n' +
      `Apēdot (izmantojot) šo zivi tu saņemsi statusu **"${statusList.veiksmigs}"** ` +
      `uz \`${millisToReadableTime(PETNIEKZIVS_STATUS_TIME)}\`, ` +
      `kas palielina feniksa, ruletes un loto biļešu procentus`,
    addedInVersion: '4.1',
    nameNomVsk: 'pētniekzivs',
    nameNomDsk: 'pētniekzivis',
    nameAkuVsk: 'pētniekzivi',
    nameAkuDsk: 'pētniekzivis',
    isVirsiesuDzimte: false,
    emoji: () => emoji('petniekzivs'),
    imgLink: 'https://www.ulmanbots.lv/images/items/petniekzivs.png',
    categories: [ItemCategory.ZIVIS],
    value: 40,
    removedOnUse: true,
    use: petniekzivs,
  }),

  // -- velosipēds --
  velosipeds: item<BaseItem>({
    info:
      'Šis velosipēds nav braucošā stāvoklī, bet vismaz tu to vari pārdot!\n\n' +
      'Velosipēdu var iegūt to sataisot ar velosipēda detaļām (rāmis, riteņi, ķēde un stūre)',
    addedInVersion: '4.0',
    nameNomVsk: 'velosipēds',
    nameNomDsk: 'velosipēdi',
    nameAkuVsk: 'velosipēdu',
    nameAkuDsk: 'velosipēdus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('velosipeds'),
    imgLink: 'https://www.ulmanbots.lv/images/items/velosipeds.png',
    categories: [ItemCategory.OTHER],
    value: 250,
  }),
  velo_ramis: item<UsableItem>({
    info: veloInfo,
    addedInVersion: '4.0',
    nameNomVsk: 'velosipēda rāmis',
    nameNomDsk: 'velosipēda rāmji',
    nameAkuVsk: 'velosipēda rāmi',
    nameAkuDsk: 'velosipēda rāmjus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('velo_ramis'),
    imgLink: 'https://www.ulmanbots.lv/images/items/velo_ramis.png',
    categories: [ItemCategory.OTHER],
    value: 10,
    removedOnUse: false,
    use: velo,
  }),
  velo_ritenis: item<UsableItem>({
    info: veloInfo,
    addedInVersion: '4.0',
    nameNomVsk: 'velosipēda ritenis',
    nameNomDsk: 'velosipēda riteņi',
    nameAkuVsk: 'velosipēda riteni',
    nameAkuDsk: 'velosipēda riteņus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('velo_ritenis'),
    imgLink: 'https://www.ulmanbots.lv/images/items/velo_ritenis.png',
    categories: [ItemCategory.OTHER],
    value: 10,
    removedOnUse: false,
    use: velo,
  }),
  velo_kede: item<UsableItem>({
    info: veloInfo,
    addedInVersion: '4.0',
    nameNomVsk: 'velosipēda ķēde',
    nameNomDsk: 'velosipēda ķēdes',
    nameAkuVsk: 'velosipēda ķēdi',
    nameAkuDsk: 'velosipēda ķēdes',
    isVirsiesuDzimte: false,
    emoji: () => emoji('velo_kede'),
    imgLink: 'https://www.ulmanbots.lv/images/items/velo_kede.png',
    categories: [ItemCategory.OTHER],
    value: 10,
    removedOnUse: false,
    use: velo,
  }),
  velo_sture: item<UsableItem>({
    info: veloInfo,
    addedInVersion: '4.0',
    nameNomVsk: 'velosipēda stūre',
    nameNomDsk: 'velosipēda stūres',
    nameAkuVsk: 'velosipēda stūri',
    nameAkuDsk: 'velosipēda stūres',
    isVirsiesuDzimte: false,
    emoji: () => emoji('velo_sture'),
    imgLink: 'https://www.ulmanbots.lv/images/items/velo_sture.png',
    categories: [ItemCategory.OTHER],
    value: 10,
    removedOnUse: false,
    use: velo,
  }),

  // -- citas mantas --
  kafija: item<UsableItem>({
    info:
      `Strādāt ir grūti ja esi noguris, izdzer kafiju!\n\n` +
      'Kafija ir izmantojama, kad tev noteiktā dienā ir beigušās strādāšanas reizes\n' +
      'Komandai `/stradat` ir poga `izdzert kafiju` lai strādātu vēlreiz',
    addedInVersion: '4.0',
    nameNomVsk: 'kafija',
    nameNomDsk: 'kafijas',
    nameAkuVsk: 'kafiju',
    nameAkuDsk: 'kafijas',
    isVirsiesuDzimte: false,
    emoji: () => emoji('kafija'),
    imgLink: 'https://www.ulmanbots.lv/images/items/kafija.png',
    categories: [ItemCategory.OTHER],
    value: 30,
    removedOnUse: false,
    use: kafija,
  }),

  // prettier-ignore
  dizmakskere: item<AttributeItem<{ 
    durability: number
  }>>({

    info:
      'UlmaņBota veidotājs rakstot šo aprakstu aizmirsa kāpēc dižmakšķere eksistē...\n\n' +
      'Dižmakšķere var nocopēt tikai un vienīgi vērtīgas mantas, tajā skaitā visas mantas kas nopērkamas tirgū\n',
    addedInVersion: '4.0',
    nameNomVsk: 'dižmakšķere',
    nameNomDsk: 'dižmakšķeres',
    nameAkuVsk: 'dižmakšķeri',
    nameAkuDsk: 'dižmakšķeres',
    isVirsiesuDzimte: false,
    emoji: () => emoji('dizmakskere'),
    imgLink: 'https://www.ulmanbots.lv/images/items/dizmakskere.gif',
    categories: [ItemCategory.MAKSKERE],
    value: 500,
    customValue: makskereCustomValue('dizmakskere'),
    attributes: () => ({
      durability: maksekeresData.dizmakskere.maxDurability,
    }),
    sortBy: { durability: 1 },
    use: makskere,
  }),
  smilsu_pulkstenis: item<UsableItem>({
    info:
      'Izmantojot smilšu pulksteni zvejošanas laiks maģiski tiks pārbīdīts uz priekšu ' +
      `par \`${millisToReadableTime(ZVEJA_SHIFT_TIME)}\``,
    addedInVersion: '4.0',
    nameNomVsk: 'smilšu pulkstenis',
    nameNomDsk: 'smilšu pulksteņi',
    nameAkuVsk: 'smilšu pulksteni',
    nameAkuDsk: 'smilšu pulksteņus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('smilsu_pulkstenis'),
    imgLink: 'https://www.ulmanbots.lv/images/items/smilsu_pulkstenis.gif',
    categories: [ItemCategory.OTHER],
    value: 75,
    removedOnUse: false,
    use: smilsu_pulkstenis,
  }),
  kaka_parsaucejs: item<UsableItem>({
    info: () =>
      `Ar šo mantu var nomainīt **${itemList.kakis.emoji()} Kaķa** vārdu\n` +
      `Ja tev inventārā ir ${itemString('kaka_parsaucejs', null)}, izmantojot kaķi tev piedāvās nomainīt tā vārdu`,
    addedInVersion: '4.2',
    nameNomVsk: 'kaķa pārsaucējs', // TODO: labāks nosaukums
    nameNomDsk: 'kaķa pārsaucēji',
    nameAkuVsk: 'kaķa pārsaucēju',
    nameAkuDsk: 'kaķa pārsaucējus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('kaka_parsaucejs'),
    imgLink: 'https://www.ulmanbots.lv/images/items/kaka_parsaucejs.png',
    categories: [ItemCategory.OTHER],
    value: 90,
    removedOnUse: false,
    use: function () {
      // @ts-ignore
      return { text: this.info() };
    },
  }),
  piparkuka: item<UsableItem>({
    info:
      'Apēdot piparkūku tiks izlaists gaidīšanas laiks līdz nākamajai strādāšanas **un** ubagošanas reizei\n' +
      'Piparkūku var atrast ubagojot decembrī',
    addedInVersion: '4.2',
    nameNomVsk: 'piparkūka',
    nameNomDsk: 'piparkūkas',
    nameAkuVsk: 'piparkūku',
    nameAkuDsk: 'piparkūkas',
    isVirsiesuDzimte: false,
    emoji: () => emoji('piparkuka'),
    imgLink: 'https://www.ulmanbots.lv/images/items/piparkuka.png',
    categories: [ItemCategory.OTHER],
    value: 25,
    removedOnUse: false,
    use: piparkuka,
  }),
  zivju_kaste: {
    info: 'Šī kaste satur zivis',
    addedInVersion: '4.3',
    nameNomVsk: 'zivju kaste',
    nameNomDsk: 'zivju kastes',
    nameAkuVsk: 'zivju kasti',
    nameAkuDsk: 'zivju kastes',
    isVirsiesuDzimte: false,
    emoji: () => emoji('zivju_kaste'), // TODO:
    imgLink: null,
    categories: [ItemCategory.OTHER],
    value: 10,
    removedOnUse: false,
    use: () => ({
      text: 'chau',
    }),
  },
  nabagloto: item<UsableItem & LotoItem>({
    info: 'Slapja un netīra loto biļete kuru var atrast uz ietves malas, iespējams iegūt no ubagošanas (`/ubagot`)',
    addedInVersion: '4.3',
    nameNomVsk: 'nabagLoto biļete',
    nameNomDsk: 'nabagLoto biļetes',
    nameAkuVsk: 'nabagLoto biļeti',
    nameAkuDsk: 'nabagLoto biļetes',
    isVirsiesuDzimte: false,
    emoji: () => emoji('nabagloto'),
    imgLink: null, // TODO
    categories: [ItemCategory.LOTO],
    value: 10,
    removedOnUse: false,
    lotoOptions: nabagLotoOptions,
    use: nabagloto,
  }),
  ulmanloto: item<UsableItem & LotoItem>({
    info: 'Reta un ļoti ekskluzīva loto biļete kas garantēs lielu peļņu tās skrāpētājam',
    addedInVersion: '4.3',
    nameNomVsk: 'ulmaņLoto biļete',
    nameNomDsk: 'ulmaņLoto biļetes',
    nameAkuVsk: 'ulmaņLoto biļeti',
    nameAkuDsk: 'ulmaņLoto biļetes',
    isVirsiesuDzimte: false,
    emoji: () => emoji('ulmanloto'),
    imgLink: null, // TODO
    categories: [ItemCategory.LOTO],
    value: 500,
    removedOnUse: false,
    lotoOptions: ulmanlotoOptions,
    use: ulmanloto,
  }),

  avene: item<UsableItem>({
    info: ogaInfo('avene'),
    addedInVersion: '4.3',
    nameNomVsk: 'avene',
    nameNomDsk: 'avenes',
    nameAkuVsk: 'aveni',
    nameAkuDsk: 'avenes',
    isVirsiesuDzimte: false,
    emoji: () => emoji('avene'),
    imgLink: null,
    categories: [ItemCategory.OTHER],
    value: 15,
    removedOnUse: false,
    use: oga('avene'),
  }),
  mellene: item<UsableItem>({
    info: ogaInfo('mellene'),
    addedInVersion: '4.3',
    nameNomVsk: 'mellene',
    nameNomDsk: 'mellenes',
    nameAkuVsk: 'melleni',
    nameAkuDsk: 'mellenes',
    isVirsiesuDzimte: false,
    emoji: () => emoji('mellene'),
    imgLink: null,
    categories: [ItemCategory.OTHER],
    value: 15,
    removedOnUse: false,
    use: oga('mellene'),
  }),

  vinoga: item<UsableItem>({
    info: ogaInfo('vinoga'), //TODO
    addedInVersion: '4.3',
    nameNomVsk: 'vīnoga',
    nameNomDsk: 'vīnogas',
    nameAkuVsk: 'vīnogu',
    nameAkuDsk: 'vīnogas',
    isVirsiesuDzimte: false,
    emoji: () => emoji('vinoga'),
    imgLink: null,
    categories: [ItemCategory.OTHER],
    value: 15,
    removedOnUse: false,
    use: oga('vinoga'),
  }),

  zemene: item<UsableItem>({
    info: ogaInfo('zemene'),
    addedInVersion: '4.3',
    nameNomVsk: 'zemene',
    nameNomDsk: 'zemenes',
    nameAkuVsk: 'zemeni',
    nameAkuDsk: 'zemenes',
    isVirsiesuDzimte: false,
    emoji: () => emoji('zemene'),
    imgLink: null,
    categories: [ItemCategory.OTHER],
    value: 15,
    removedOnUse: false,
    use: oga('zemene'),
  }),

  janoga: item<UsableItem>({
    info: ogaInfo('janoga'),
    addedInVersion: '4.3',
    nameNomVsk: 'jāņoga',
    nameNomDsk: 'jāņogas',
    nameAkuVsk: 'jāņogu',
    nameAkuDsk: 'jāņogas',
    isVirsiesuDzimte: false,
    emoji: () => emoji('janoga'),
    imgLink: null,
    categories: [ItemCategory.OTHER],
    value: 15,
    removedOnUse: false,
    use: oga('janoga'),
  }),

  kruma_sekla: item<UsableItem>({
    info: () =>
      `Ogu krūma sēklu var iestādīt, lai izaudzētu **${itemString('ogu_krums', null, true)}**\n` +
      `Iestādot krūma sēklu, tiks izvēlēti nejauši ogu krūma atribūti, piemēram, ogas tips, augšanas laiks, utt.`,
    addedInVersion: '4.3',
    nameNomVsk: 'ogu kruma sēkla',
    nameNomDsk: 'ogu krūma sēklas',
    nameAkuVsk: 'ogu krūma sēklu',
    nameAkuDsk: 'ogu krūma sēklas',
    isVirsiesuDzimte: false,
    emoji: () => emoji('kruma_sekla'), // TODO:
    imgLink: null,
    categories: [ItemCategory.OTHER],
    value: 10,
    removedOnUse: false,
    use: kruma_sekla,
  }),

  // prettier-ignore
  ogu_krums: item<AttributeItem<{
    berryType: string,
    growthTime: number,
    maxBerries: number,
    lastUsed: number,
    apliets: number,
    iestadits: number,
    apliesanasReizes: number,
  }>>({

    info:
      'Kļūsti par īstu dārznieku.\n' +
      'Katrs ogu krūms, ko iegūsti būs ar nejauši izvēlētu ogu tipu\n' +
      '(Tas tādēļ, jo biji ierāvis kamēr to stādiji)\n' +
      'Katram krūmam arī ir limitēts maksimālo ogu skaits (arī tiek nejauši izvēlēts)', // TODO`
    addedInVersion: '4.3',
    nameNomVsk: 'ogu krūms',
    nameNomDsk: 'ogu krūmi',
    nameAkuVsk: 'ogu krūmu',
    nameAkuDsk: 'ogu krūmus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('ogu_krums'),
    imgLink: 'https://beanson.lv/images/krums.png',
    categories: [ItemCategory.OTHER],
    value: 400,
    //ak mans dievs... attributi nekad nebeidzas
    attributes: (currTime) => ({
      berryType: getRandomOga(),
      growthTime: getRandomGrowthTime(),
      maxBerries: getRandomMaxOgas(),
      lastUsed: 0,
      apliets: currTime,
      iestadits: currTime,
      apliesanasReizes: getRandomApliesanasReizes(),
    }),
    use: ogukrums,
    sortBy: { berryType: 1 },
  }),

  // prettier-ignore
  ievarijums: item<AttributeItem<{
    properties?: BerryProperties;
    ogas?: Record<ItemKey, number>;
    distance?: number;
  }>>({
    info: '', //TODO
    addedInVersion: '4.3',
    nameNomVsk: 'ievārījums',
    nameNomDsk: 'ievārījumi',
    nameAkuVsk: 'ievārījumu',
    nameAkuDsk: 'ievārījumus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('ievarijums'), // TODO: 
    imgLink: null,
    categories: [ItemCategory.OTHER],
    value: 15,
    attributes: () => ({
      properties: {
        saldums: 0,
        skabums: 0,
        rugtums: 0,
        slapjums: 0,
      },
      ogas: {},
      distance: 0
    }),
    sortBy: { distance: 1 },
    use: ievarijums
  }),

  // TODO: noņemt
  roltons: item<UsableItem>({
    info: 'Patiesi viena no visu laiku labākajām maltītēm',
    addedInVersion: '4.3',
    nameNomVsk: 'roltons',
    nameNomDsk: 'roltoni',
    nameAkuVsk: 'roltonu',
    nameAkuDsk: 'roltonus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('roltons'),
    imgLink: 'https://beanson.lv/images/roltons.png',
    categories: [ItemCategory.ATKRITUMI],
    value: 15,
    removedOnUse: false,
    use: async () => ({ text: 'Tas bija garšīgs... laikam.' }),
  }),

  // granulu katls
  // cena 5700 lati

  // TODO: noņemt
  patriota_piespraude: item<AttributeItem<{ piespraudeNum: number }> & NotSellableItem>({
    info: '...',
    addedInVersion: '4.3',
    nameNomVsk: 'patriotu piespraude',
    nameNomDsk: 'patriotu piespraudes',
    nameAkuVsk: 'patriotu piespraudi',
    nameAkuDsk: 'patriotu piespraudes',
    isVirsiesuDzimte: false,
    emoji: () => emoji('piespraude'),
    imgLink: null,
    categories: [ItemCategory.OTHER],
    value: 0,
    notSellable: true,
    attributes: () => ({
      piespraudeNum: 0,
    }),
    sortBy: { piespraudeNum: 1 },
    use: () => ({ text: 'chau' }),
  }),

  // -- brīvgriezieni --
  brivgriez10: item<UsableItem>({
    info: brivgriezInfo,
    addedInVersion: '4.0',
    nameNomVsk: '10 latu brīvgrieziens',
    nameNomDsk: '10 latu brīvgriezieni',
    nameAkuVsk: '10 latu brīvgriezienu',
    nameAkuDsk: '10 latu brīvgriezienus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('brivgriez10'),
    imgLink: 'https://www.ulmanbots.lv/images/items/brivgriez10.png',
    categories: [ItemCategory.BRIVGRIEZIENS],
    value: 2,
    removedOnUse: false,
    use: brivgrieziens(10),
  }),
  brivgriez25: item<UsableItem>({
    info: brivgriezInfo,
    addedInVersion: '4.0',
    nameNomVsk: '25 latu brīvgrieziens',
    nameNomDsk: '25 latu brīvgriezieni',
    nameAkuVsk: '25 latu brīvgriezienu',
    nameAkuDsk: '25 latu brīvgriezienus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('brivgriez25'),
    imgLink: 'https://www.ulmanbots.lv/images/items/brivgriez25.png',
    categories: [ItemCategory.BRIVGRIEZIENS],
    value: 5,
    removedOnUse: false,
    use: brivgrieziens(25),
  }),
  brivgriez50: item<UsableItem>({
    info: brivgriezInfo,
    addedInVersion: '4.0',
    nameNomVsk: '50 latu brīvgrieziens',
    nameNomDsk: '50 latu brīvgriezieni',
    nameAkuVsk: '50 latu brīvgriezienu',
    nameAkuDsk: '50 latu brīvgriezienus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('brivgriez50'),
    imgLink: 'https://www.ulmanbots.lv/images/items/brivgriez50.png',
    categories: [ItemCategory.BRIVGRIEZIENS],
    value: 10,
    removedOnUse: false,
    use: brivgrieziens(50),
  }),
  brivgriez100: item<UsableItem>({
    info: brivgriezInfo,
    addedInVersion: '4.0',
    nameNomVsk: '100 latu brīvgrieziens',
    nameNomDsk: '100 latu brīvgriezieni',
    nameAkuVsk: '100 latu brīvgriezienu',
    nameAkuDsk: '100 latu brīvgriezienus',
    isVirsiesuDzimte: true,
    emoji: () => emoji('brivgriez100'),
    imgLink: 'https://www.ulmanbots.lv/images/items/brivgriez100.png',
    categories: [ItemCategory.BRIVGRIEZIENS],
    value: 20,
    removedOnUse: false,
    use: brivgrieziens(100),
  }),

  // -- ziemassvētku mantas --
  salaveca_cepure: item<UsableItem>({
    info: () =>
      `Salaveča cepuri var uzvilkt:\n` +
      ['petnieks', 'kakis'].map(key => `• **${itemString(key)}**\n`).join('') +
      `\nUzvelkot cepuri mainīsies mantas izskats (emoji), uzvilkt cepuri var izmantojot mantu kurai vēlies to uzvilkt`,
    addedInVersion: '4.2',
    nameNomVsk: 'salaveča cepure',
    nameNomDsk: 'salaveča cepures',
    nameAkuVsk: 'salaveča cepuri',
    nameAkuDsk: 'salaveča cepures',
    isVirsiesuDzimte: false,
    emoji: () => emoji('salaveca_cepure'),
    imgLink: 'https://www.ulmanbots.lv/images/items/salaveca_cepure.png',
    categories: [ItemCategory.ADVENTE_2022],
    value: 75,
    removedOnUse: false,
    use: function () {
      // @ts-ignore
      return { text: this.info() };
    },
  }),
};

export default itemList;
