import { AutocompleteInteraction } from 'discord.js';
import stringSimilarity from 'string-similarity';
import normalizeLatText from '../../../embeds/helpers/normalizeLatText';
import { MinecraftPrece, minecraftPreces } from './minecraftPreces';

type ItemWithRating = [MinecraftPrece, number];

function filterGreaterThan(num: number) {
  return (item: ItemWithRating) => item[1] >= num - 0.2;
}

export default async function mcPirktAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
  const focusedValue = normalizeLatText(interaction.options.getFocused() as string);

  const allChoices = [...minecraftPreces];

  const itemsToQueryNames = allChoices.map(item => normalizeLatText(item.name));

  const queryResult = stringSimilarity.findBestMatch(focusedValue, itemsToQueryNames);

  if (queryResult.bestMatch.rating === 0) {
    return await interaction
      .respond(
        allChoices.map(item => ({
          name: `💰 [${item.price} lati] ${item.name}`,
          value: item.itemId,
        }))
      )
      .catch(_ => _);
  }

  // pievieno reitingu katrai mantai sarakstā
  const itemsWithRatings: ItemWithRating[] = queryResult.ratings.map(({ rating }, index) => [
    allChoices[index],
    rating,
  ]);

  const sorted = itemsWithRatings
    .sort((a, b) => b[1] - a[1])
    .filter(filterGreaterThan(queryResult.bestMatch.rating))
    .slice(0, 25);

  await interaction
    .respond(
      sorted.map(([item]) => ({
        name: `💰 [${item.price} lati] ${item.name}`,
        value: item.itemId,
      }))
    )
    .catch(_ => _);
}
