const { SimplicityEmbed, SimplicityListener, Utils } = require('../../../index')
const { cleanString } = Utils

class ChannelUpdate extends SimplicityListener {
  constructor (client) {
    super(client)
  }

  async on (_, oldChannel, newChannel) {
    const guild = newChannel.guild
    if (!guild) return

    const embed = new SimplicityEmbed(this.getFixedT(guild.id))
      .setTimestamp()
      .setAuthor(guild.name, Utils.getServerIconURL(guild))
      .setFooter('loggers:channelId', '', { id: newChannel.id })

    let executor
    if (guild.me.permissions.has('VIEW_AUDIT_LOG')) {
      const entry = await guild.fetchAuditLogs({ type: 'CHANNEL_UPDATE' }).then(audit => audit.entries.first())
      if (entry && (entry.target && entry.target.id === newChannel.id) && entry.createdTimestamp > Date.now() - 5000)
        executor = entry.executor
    }

    // NAME CHANGES
    if (oldChannel.name !== newChannel.name) {
      if (executor)
        embed.setDescription('loggers:channelNameChangedExecutor', { type: newChannel.type, oldName: oldChannel.name, newName: newChannel.name, executor })
      else
        embed.setDescription('loggers:channelNameChanged', { type: newChannel.type, oldName: oldChannel.name, newName: newChannel.name })

      return this.sendLogMessage(guild.id, 'ChannelUpdate', embed).catch(() => null)
    } else
    // TOPIC CHANGES
    if (oldChannel.topic !== newChannel.topic) {
      if (executor)
        embed.setDescription('loggers:channelTopicChangedExecutor', { name: newChannel.name, executor })
      else
        embed.setDescription('loggers:channelTopicChanged', { name: newChannel.name })

      embed
        .addField('loggers:before', cleanString(oldChannel.topic, 0, 1024), true)
        .addField('loggers:after', cleanString(newChannel.topic), true, 0, 1024)
      return this.sendLogMessage(guild.id, 'ChannelUpdate', embed).catch(() => null)
    }
  }
}

module.exports = ChannelUpdate
