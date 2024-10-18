// other imports
import dotenv from 'dotenv'
import { readdirSync } from 'fs'

// discord imports
import {
  Client,
  Collection,
  CommandInteraction,
  Snowflake,
  Partials,
  IntentsBitField,
  Events,
  Interaction,
  ActivityType,
} from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import {
  AudioPlayer,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnections,
} from '@discordjs/voice'

import { getCurrentTitle, getStream, getXspfData } from './utils/icecast.js'
import { createEmbed } from './utils/embed.js'
import interactionCreate from './handlers/interactionCreate.js'

//
// setup .env
dotenv.config({ encoding: 'utf8' })
const {
  BOT_TOKEN,
  XSPF_INTERVAL = `${1e3}`,
  ICECAST_ENDPOINT = '',
} = process.env

//
// setup discord
export interface ExtendedClient extends Client {
  commands: Collection<string, Command>
  createEmbed: typeof createEmbed
  streamMetadata: {
    interval?: NodeJS.Timeout
    title?: string
    endpointAudio: string
    endpointXspl: string
  }
  audioPlayer: AudioPlayer
}
export interface Command {
  data: SlashCommandBuilder
  name: string
  description: string
  usage?: string
  execute: (data: {
    client: ExtendedClient
    interaction: CommandInteraction
  }) => Promise<any>
}

// create discord client
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildVoiceStates,
    IntentsBitField.Flags.GuildPresences,
    IntentsBitField.Flags.MessageContent,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.GuildMember],
}) as ExtendedClient

client.streamMetadata = {
  endpointAudio: ICECAST_ENDPOINT,
  endpointXspl: ICECAST_ENDPOINT + '.xspf',
}
client.audioPlayer = createAudioPlayer({ debug: true })

// cheese
client.commands = new Collection()

// commander
const commandFiles = readdirSync('./dist/commands').filter(cmd =>
  cmd.endsWith('.js')
)
for (const name of commandFiles) {
  const { default: command } = (await import(`./commands/${name}`)) as {
    default: Command
  }
  client.commands.set(command.name, command)
}

// utils functions
client.createEmbed = createEmbed

console.time('client-ready')
client.once('ready', async () => {
  console.timeEnd('client-ready')

  // listen to user commands
  client.on(Events.InteractionCreate, (interaction: Interaction) =>
    interactionCreate(client, interaction)
  )

  // get metadata of stream
  client.streamMetadata.interval = setInterval(async () => {
    const data = await getXspfData(client.streamMetadata.endpointXspl)
    const title = getCurrentTitle(data)

    if (client.streamMetadata.title != title) {
      client.streamMetadata.title = title

      // update bot activity
      client.user?.setActivity({
        name: title,
        type: ActivityType.Listening,
      })
    }
  }, parseInt(XSPF_INTERVAL))
})

if (BOT_TOKEN)
  client
    .login(BOT_TOKEN)
    .then(() => {
      if (!client.user)
        throw new Error('User object is null after client login')

      const { user, guilds } = client
      console.log(
        '[bot]',
        `Logged in as: ${user?.tag}`,
        `in ${guilds.cache.size} servers`
      )
    })
    .catch(error => console.error('[bot:error]', error))
else throw new Error("No bot token, can't login! exiting.")
