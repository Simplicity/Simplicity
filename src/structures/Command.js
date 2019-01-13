const { MessageEmbed } = require('discord.js')
const { PERMISSIONS } = require('../utils/Constants')

class Command {
  constructor (client) {
    this.client = client
    this.name = 'none'
    this.category = 'none'
    this.aliases = []
    this.description = 'No description'
    this.usage = 'No example'
    this.argsRequired = false
    this.devsOnly = false
    this.permissions = []
    this.clientPermissions = []
  }
  run () {}
  _run (message, args) {
    if ((this.devsOnly || ['developer', 'dev', 'devs'].includes(this.category.toLowerCase())) && !process.env.DEVS.includes(message.author.id)) {
      return message.channel.send('You must be a developer in order to execute this command!')
    }
    if (this.argsRequired && args.length === 0) {
      const embed = new MessageEmbed()
        .setTimestamp()
        .setFooter(`Executed by: ${message.author.tag}`, message.author.displayAvatarURL({ size: 2048 }))
        .setColor('RED')
        .setTitle('Missing Parameters!')
        .setDescription(this.usage)
      message.channel.send(embed)
        .then(m => m.delete(10000))
      message.delete(10000)
      return
    }
    let ClientPermissions = this.clientPermissions.filter(p => !message.guild.me.permissions.has(p))
    if (ClientPermissions.length !== 0) {
      let permissions = ClientPermissions.map(p => PERMISSIONS[p]).join(', ')
      let embed = new MessageEmbed()
        .setTitle('Missing Permissions!')
        .setDescription(`I require the ${permissions} permission in order to execute this command!`)
        .setColor('RED')
        .setFooter(`Executed by: ${message.author.tag}`, message.author.displayAvatarURL({ size: 2048 }))
        .setTimestamp()
      message.channel.send(embed)
        .then(m => m.delete(10000))
      message.delete(10000)
      return
    }
    let UserPermissions = this.permissions.filter(p => !message.member.permissions.has(p))
    if (UserPermissions.length !== 0) {
      let permissions = ClientPermissions.map(p => PERMISSIONS[p]).join(', ')
      let embed = new MessageEmbed()
        .setTitle('Missing Permissions!')
        .setDescription(`You require the ${permissions} permission in order to execute this command!`)
        .setColor('RED')
        .setFooter(`Executed by: ${message.author.tag}`, message.author.displayAvatarURL({ size: 2048 }))
        .setTimestamp()
      message.channel.send(embed)
        .then(m => m.delete(10000))
      message.delete(10000)
      return
    }
    this.run(message, args)
  }
}

module.exports = Command
