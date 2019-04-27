const { Command, SimplicityEmbed, CommandError, Parameters } = require('../..')
const { StringParameter } = Parameters

class Prefix extends Command {
  constructor (client) {
    super(client)
    this.name = 'prefix'
    this.category = 'bot'
    this.aliases = [ 'setprefix', 'p', 'setp', 'prefixset' ]
    this.requirements = {
      argsRequired: true,
      permissions: [ 'MANAGE_GUILD' ] }
  }

  async run ({ author, client, guild, prefix: currentPrefix, query, send, t }) {
    const prefix = await StringParameter.parse(query, {
      maxLength: 15,
      minLength: 1,
      errors: {
        maxLength: 'commands:prefix.multiCharacters'
      }
    })

    if (currentPrefix === prefix) throw new CommandError('commands:prefix.alreadySet', { prefix })

    const data = await client.database.guilds.edit(guild.id, { prefix }).catch(() => null)
    if (!data) throw new CommandError('commands:prefix.failed')

    const embed = new SimplicityEmbed({ author, t })
      .setTitle('commands:prefix.done')
      .setDescription('commands:prefix.success', { prefix })
    await send(embed)
  }
}

module.exports = Prefix
