import { ClientSession } from 'mongoose';
import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';
import userCache from '../utils/userCache';

export default async function setLati(
  userId: string,
  guildId: string,
  lati: number,
  session: ClientSession | null = null,
): Promise<UserProfile | undefined> {
  try {
    const res = (await User.findOneAndUpdate(
      { userId, guildId },
      { $set: { lati } },
      { new: true, upsert: true },
    ).session(session)) as UserProfile;

    // if (!userCache[guildId]) userCache[guildId] = {};
    // userCache[guildId][userId] = res;

    return JSON.parse(JSON.stringify(res)) as UserProfile;
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
