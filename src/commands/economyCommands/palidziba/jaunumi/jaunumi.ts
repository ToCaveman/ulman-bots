import {
  ActionRowBuilder,
  BaseInteraction,
  ChatInputCommandInteraction,
  ComponentType,
  EmbedField,
  StringSelectMenuBuilder,
} from 'discord.js';
import commandColors from '../../../../embeds/commandColors';
import embedTemplate, { ULMANBOTA_VERSIJA } from '../../../../embeds/embedTemplate';
import intReply from '../../../../utils/intReply';
import updatesList, { VersionString } from './updatesList';
import { Dialogs } from '../../../../utils/Dialogs';
import errorEmbed from '../../../../embeds/errorEmbed';

type State = {
  selectedVersion: VersionString;
};

function view(state: State, i: BaseInteraction) {
  const { date, description, fields } = updatesList[state.selectedVersion]();

  const updates = Object.entries(updatesList).map(([k, v]) => [k, v()] as const);

  const components = [
    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('jaunumi_select')
        .addOptions(
          updates
            .map(([v, { date }]) => ({ label: v, description: date, value: v, default: state.selectedVersion === v }))
            .toReversed(),
        ),
    ),
  ];

  return embedTemplate({
    i,
    color: commandColors.info,
    title: `Jaunumi - Versija ${state.selectedVersion} (${date})`,
    description,
    fields: fields as EmbedField[],
    components,
  });
}

export default async function jaunumi(i: ChatInputCommandInteraction) {
  const dialogs = new Dialogs<State>(i, { selectedVersion: ULMANBOTA_VERSIJA }, view, 'palidziba', { time: 300000 });

  if (!(await dialogs.start())) {
    return intReply(i, errorEmbed);
  }

  dialogs.onClick(async (int, state) => {
    if (int.customId === 'jaunumi_select' && int.componentType === ComponentType.StringSelect) {
      state.selectedVersion = int.values[0] as VersionString;
      return {
        update: true,
      };
    }
  });
}
