const { Command } = require('../../')

class Say extends Command {
  constructor (client) {
    super(client)
    this.category = 'general'
    this.requirements = { argsRequired: true, clientPermissions: ['MANAGE_MESSAGES'] }
  }
  run ({ message, args }) {
    message.delete()
    message.channel.send(args.join(' '))
  }
}
module.exports = Say
