const { CommandContext } = require('../')

module.exports = async function onMessage (message) {
  if (message.author.bot || message.type === 'dm' || !message.guild.me.permissions.has('SEND_MESSAGES')) return

  if (message.mentions.has(this.user.id) && message.guild.me.permissions.has(['USE_EXTERNAL_EMOJIS', 'ADD_REACTIONS']) && this.emojis.has(process.env.EMOJI_PINGSOCK_ID)) {
    message.react(process.env.EMOJI_PINGSOCK_ID)
  }

  const guildData = await this.database.guilds.get(message.guild.id)
  const prefix = (guildData && guildData.prefix) ? guildData.prefix : process.env.PREFIX
  const botMention = this.user.toString()
  const usedPrefix = message.content.startsWith(botMention) ? `${botMention} ` : message.content.startsWith(prefix) ? prefix : null

  if (usedPrefix) {
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const commandName = args.shift().toLowerCase()
    const command = this.commands.find(c => c.name.toLowerCase() === commandName || c.aliases.includes(commandName))

    if (command) {
      command.run(new CommandContext({
        prefix: usedPrefix,
        query: args.join(' '),
        command,
        message
      }), args)
    }
  }
}
