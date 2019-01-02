const { MessageEmbed } = require('discord.js')
const { inspect } = require('util')
module.exports = {
  run: async function (message, client, args) {
    if (!process.env.DEVS.includes(message.author.id)) {
      return message.reply('You must be a developer in order to execute this command!')
    };
    if (args.length === 0) {
      return message.reply('You didn\'t provide the code!')
    };
    let code = args.join(' ').replace(/^```(js|javascript ?\n)?|```$/g, '')
    let value = (l, c) => `\`\`\`${l}\n${String(c).slice(0, 1000) + (c.length >= 1000 ? '...' : '')}\n\`\`\``.replace(process.env.BOT_TOKEN, () => '*'.repeat(process.env.BOT_TOKEN.length))
    let embed = new MessageEmbed()
      .setColor('#36393F')
    try {
      // eslint-disable-next-line no-eval
      let resultEval = eval(code)
      let toEval = typeof resultEval === 'string' ? resultEval : inspect(resultEval, { depth: 1 })
      embed.addField('Result', value('js', toEval))
      embed.addField('Type', value('css', typeof resultEval))
    } catch (error) {
      embed.addField('Error', value('js', error))
    } finally {
      message.channel.send(embed)
    };
  },
  aliases: ['compile']
}
