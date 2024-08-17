import { REST } from 'discord.js';
import validateEnv from './utils/validateEnv';
import { APIEmoji, RESTGetAPIApplicationEmojisResult, Routes } from 'discord-api-types/v10';
import chalk from 'chalk';

if (!validateEnv()) process.exit(1);

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

async function getUploadedEmojis() {
  const emojis = (await rest.get(Routes.applicationEmojis(process.env.BOT_ID!))) as RESTGetAPIApplicationEmojisResult;
  return emojis.items;
}

async function deleteEmojis(emojis: APIEmoji[]) {
  const promises: Promise<any>[] = [];

  let deletedCount = 0;

  const errors: any[] = [];

  for (const { id, name } of emojis) {
    promises.push(
      rest
        .delete(Routes.applicationEmoji(process.env.BOT_ID!, id!))
        .then(() => deletedCount++)
        .catch(e => errors.push(e))
        .finally(() => {
          process.stdout.clearLine(0);
          process.stdout.write(
            `${chalk.blue(`\r[${deletedCount}/${emojis.length}]`)} Deleted emoji "${name}" ${errors.length ? `(errors: ${errors.length})` : ''}`,
          );
        }),
    );

    await Promise.all(promises);

    if (errors.length) {
      for (const e of errors) {
        console.error(e);
      }
    }
  }
}

const uploadedEmojis = await getUploadedEmojis();
console.log(`Uploaded emoji count: ${uploadedEmojis.length}`);

if (uploadedEmojis.length === 0) {
  console.log(chalk.green('Nothing to delete'));
} else {
  console.log(`Deleting ${uploadedEmojis.length} emojis...`);
  await deleteEmojis(uploadedEmojis);
  console.log('\n' + chalk.green('Done!'));
}
