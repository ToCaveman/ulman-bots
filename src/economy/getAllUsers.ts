import UserProfile from '../interfaces/UserProfile';
import User from '../schemas/User';
import { ClientSession, ProjectionType } from 'mongoose';

export default async function getAllUsers(
  clientId: string,
  guildId: string,
  projection: ProjectionType<UserProfile>,
  session: ClientSession | null = null,
): Promise<UserProfile[] | undefined> {
  try {
    // @ts-ignore, dabū visus lietotājus serverī izņemot pašu botu
    const res = await User.find(
      { guildId, userId: { $not: { $eq: clientId } } },
      { _id: 0, userId: 1, ...projection },
    ).session(session);

    if (!res) return;

    return JSON.parse(JSON.stringify(res)) as UserProfile[];
  } catch (e: any) {
    console.log(new Date().toLocaleString(), e.message);
  }
}
