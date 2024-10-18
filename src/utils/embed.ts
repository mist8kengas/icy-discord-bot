import { APIEmbed, EmbedData, EmbedBuilder } from 'discord.js'

export function createEmbed(data?: APIEmbed | EmbedData) {
  const embed = new EmbedBuilder(data)
  embed.setColor('#001826')

  return embed
}
