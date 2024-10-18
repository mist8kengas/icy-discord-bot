import { Command, ExtendedClient } from '../index.js'
import { Interaction } from 'discord.js'

export default async function interactionCreate(
  client: ExtendedClient,
  interaction: Interaction
) {
  // if interaction is a chat command
  if (interaction.isCommand()) {
    // get command
    const command: Command | undefined = client.commands.get(
      interaction.commandName
    )

    if (!command) return
    command.execute({ client, interaction }).catch(async error => {
      console.error('[interaction:error]', error)
      await interaction
        .followUp({
          embeds: [
            client
              .createEmbed()
              .setDescription(
                ':warning: An error occured while trying to run this command.'
              ),
          ],
          ephemeral: true,
        })
        .catch(error => console.error('[interaction:error:fatal]', error))
    })
  }
}
