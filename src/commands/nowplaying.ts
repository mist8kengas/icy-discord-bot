import { ChannelType, SlashCommandBuilder } from 'discord.js'
import { Command } from '../index.js'
import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription(
      'Display information about the current song'
    ) as SlashCommandBuilder,
  name: 'nowplaying',
  description: 'Display information about the current song',
  async execute({ client, interaction }) {
    if (!interaction.isChatInputCommand()) return
    if (!interaction.inGuild())
      throw new Error('This command can only be executed in a guild')

    // get connection
    const connection = getVoiceConnection(interaction.guildId)
    if (!connection) throw new Error('No active voice connection in guild')

    await interaction.reply({
      embeds: [
        client.createEmbed({
          description: [
            `Now playing`,
            `-# ${client.streamMetadata.title}`,
          ].join('\n'),
        }),
      ],
    })
  },
}
export default command
