import { ChannelType, SlashCommandBuilder } from 'discord.js'
import { Command } from '../index.js'

import { createAudioResource, joinVoiceChannel } from '@discordjs/voice'
import { getStream } from '../utils/icecast.js'

const command: Command = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music in the specified voice channel')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Voice channel to play music in')
        .setRequired(false)
    ) as SlashCommandBuilder,
  name: 'play',
  description: 'Play music in the specified voice channel',
  async execute({ client, interaction }) {
    if (!interaction.isChatInputCommand()) return
    if (!interaction.inGuild())
      throw new Error('This command can only be executed in a guild')

    const newChannel = interaction.options.getChannel('channel')
    if (newChannel && newChannel.type != ChannelType.GuildVoice)
      throw new Error('Channel specified is not a voice channel!')

    // get user voice state
    const user = await interaction.guild!.members.fetch(interaction.user.id)
    const channel = newChannel || user.voice.channel

    if (!channel)
      throw new Error(
        'You need to join or specify a voice channel to play music'
      )

    // join voice channel
    const connection = joinVoiceChannel({
      guildId: interaction.guildId,
      channelId: channel.id,
      // @ts-ignore
      adapterCreator: interaction.guild!.voiceAdapterCreator,
    })

    // read and create stream
    const iceStream = await getStream(client.streamMetadata.endpointAudio)
    if (!iceStream) throw new Error('Unable to fetch Icecast endpoint')

    const stream = createAudioResource(iceStream)
    client.audioPlayer.play(stream)

    const subscription = connection.subscribe(client.audioPlayer)
    if (!subscription) throw new Error('Unable to play audio in channel')

    await interaction.reply({
      embeds: [
        client.createEmbed({
          description: [
            `Now playing in ${channel}`,
            `-# ${client.streamMetadata.title}`,
          ].join('\n'),
        }),
      ],
    })
  },
}
export default command
