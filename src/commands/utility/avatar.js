const { Command, Embed } = require('../../')

class Avatar extends Command {
  constructor (client) {
    super(client)
    this.aliases = ['av']
    this.category = 'util'
    this.parameters = [{
      type: 'user',
      required: false
    }]
    this.requirements = { permissions: ['EMBED_LINKS'] }
  }

  run ({ author, send }, user) {
    if (!user) user = author
    const embed = new Embed({ author })
      .setImage(user.displayAvatarURL({ size: 2048 }))
    send(embed)
  }
}
module.exports = Avatar
