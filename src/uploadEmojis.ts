import { REST } from 'discord.js';
import fs from 'fs';
import path from 'path';
import validateEnv from './utils/validateEnv';
import { Routes } from 'discord-api-types/v10';
import chalk from 'chalk';

validateEnv();

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN);

let totalCount = 0;

function printDirs(dir: string, depth = 0) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      const count = fs.readdirSync(filePath).filter(file => fs.statSync(path.join(filePath, file)).isFile()).length;
      totalCount += count;

      console.log(`${' '.repeat(depth)}${file} (${count} emoji)`);

      printDirs(filePath, depth + 2);
    }
  });
}

const mimeTypes = {
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
};

let uploaded = 0;

async function upload(dir: string) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      const emojiFiles = fs.readdirSync(filePath);

      for (const emojiFile of emojiFiles) {
        const stats = fs.statSync(path.join(filePath, emojiFile));
        if (stats.isDirectory()) continue;

        const emojiFileSplit = emojiFile.split('.');

        const name = emojiFileSplit.slice(0, emojiFileSplit.length - 1).join('.');
        const extension = emojiFileSplit[emojiFileSplit.length - 1] as keyof typeof mimeTypes;

        if (!mimeTypes[extension]) {
          console.log(chalk.red("[Error] ") + `Invalid file type: ${emojiFile}, must be one of: png, jpg, gif`);
          continue;
        }

        const imageData = fs.readFileSync(path.join(filePath, emojiFile), 'base64');
        const image = `data:${mimeTypes[extension]};base64,${imageData}`;

        await rest.post(Routes.applicationEmojis(process.env.BOT_ID!), {
          body: { name: emojiFile.split('.')[0], image },
        });

        uploaded++;
        console.log(`Uploaded ${uploaded}/${totalCount} emoji (${emojiFile})`);
      }

      upload(filePath);
    }
  }
}

const emojisPath = path.join(__dirname, '../assets/emoji');

printDirs(emojisPath);

console.log(`\nTotal: ${totalCount} emoji`);

upload(emojisPath);
