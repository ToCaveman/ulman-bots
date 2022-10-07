import { Client, GatewayIntentBits } from 'discord.js';
import dotenv from 'dotenv';
import validateEnv from './utils/validateEnv';
import mongo from './utils/mongo';
import commandHandler from './commands/commandHandler';
import setupCronJobs from './utils/setupCronJobs';
import createDiscounts from './items/discounts/createDiscounts';
import autocompleteHandler from './commands/autocompleteHandler';
import chalk from 'chalk';
import setBotPresence from './utils/setBotPresence';
import createTirgus from './items/tirgus/createTirgus';

process.env.TZ = 'Europe/Riga';
dotenv.config();

// pārbauda vai .env failā ir ievadīti mainīgie
if (!validateEnv()) process.exit(1);

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  createDiscounts();
  createTirgus();
  setBotPresence(client);
  setupCronJobs(client);
  mongo().then(() => console.log('Connected to MongoDB'));
});

client.on('interactionCreate', i => {
  if (i.isChatInputCommand()) commandHandler(i);
  else if (i.isAutocomplete()) autocompleteHandler(i);
});

client.login(process.env.BOT_TOKEN).then(() => {
  console.log(chalk.yellow(client.user!.tag) + ' logged in');
});
