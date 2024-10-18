import { ChannelType, SlashCommandBuilder } from 'discord.js'
import { Command } from '../index.js'
import { getVoiceConnection, joinVoiceChannel } from '@discordjs/voice'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription(
      'Disconnect and stop playing music in the channel'
    ) as SlashCommandBuilder,
  name: 'leave',
  description: 'Disconnect and stop playing music in the channel',
  async execute({ client, interaction }) {
    if (!interaction.isChatInputCommand()) return
    if (!interaction.inGuild())
      throw new Error('This command can only be executed in a guild')

    // get connection
    const connection = getVoiceConnection(interaction.guildId)
    if (!connection) throw new Error('No active voice connection in guild')

    const disconnect = connection.disconnect()
    if (disconnect) {
      connection.destroy()

      await interaction.reply({
        embeds: [
          client.createEmbed({
            description: [`Left voice channel`].join('\n'),
          }),
        ],
      })
    } else throw new Error('Failed to disconnect')
  },
}
export default command
