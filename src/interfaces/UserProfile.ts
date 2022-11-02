import { ItemKey } from '../items/itemList';

export interface ItemInProfile {
  name: ItemKey;
  amount: number;
}

export interface ItemAttributes {
  // dīvainai burkāns, kodienu skaits
  timesUsed?: number;

  // dīvainais burkāns un kaķis
  customName?: string;

  // makšķerēm izturība
  durability?: number;

  // kafijas aparāts, pētnieks (unix millis)
  lastUsed?: number;

  // pētnieka atrastais brīvgrieziens
  foundItemKey?: ItemKey;

  // naudas maisam
  latiCollected?: number;

  // loto zivij, "satur x zivis" atribūts
  holdsFishCount?: number;

  // kaķis (unix millis)
  createdAt?: number;
  fedUntil?: number;
}

export interface SpecialItemInProfile {
  _id?: string; // ObjectId
  name: ItemKey;
  attributes: ItemAttributes;
}

export interface TimeCooldown {
  name: string;
  lastUsed: number;
}

export type DailyCooldowns = Record<
  'stradat' | 'ubagot' | 'pabalsts',
  {
    timesUsed: number;
    extraTimesUsed: number;
  }
>;

export type UserStatusName = 'aizsargats' | 'laupitajs' | 'juridisks' | 'veiksmigs';
export type UserStatus = Record<UserStatusName, number>;

export interface FishObj {
  time: number;
  itemKey: ItemKey;
}

export interface UserFishing {
  maxCapacity: number;
  selectedRod: string | null;
  usesLeft: number;
  lastCaughtFish: FishObj | null;
  futureFishList: FishObj[] | null;
  caughtFishes: Record<ItemKey, number> | null;
}

interface UserTirgus {
  // "1/1/1970"
  lastDayUsed: string;
  itemsBought: ItemKey[];
}
interface UserProfile {
  userId: string;
  guildId: string;
  lati: number;
  xp: number;
  level: number;
  jobPosition: string | null;

  itemCap: number;
  items: ItemInProfile[];
  specialItems: SpecialItemInProfile[];

  payTax: number;
  giveTax: number;

  timeCooldowns: TimeCooldown[];

  // "1/1/1970"
  lastDayUsed: string;
  dailyCooldowns: DailyCooldowns;

  status: UserStatus;

  fishing: UserFishing;

  tirgus: UserTirgus;
}

export default UserProfile;
