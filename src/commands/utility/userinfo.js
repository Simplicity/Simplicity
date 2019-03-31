const { Command, Embed, Constants: { SPOTIFY_LOGO_PNG_URL }, Parameters: { UserParameter } } = require('../../')
const moment = require('moment')
const admPermission = 'ADMINISTRATOR'

class UserInfo extends Command {
  constructor (client) {
    super(client)
    this.aliases = ['ui', 'user']
    this.category = 'util'
    this.requirements = { clientPermissions: ['EMBED_LINKS'] }
  }

  async run ({ author, channel, guild, client, send, t, query, emoji }) {
    const user = (!query ? author : await UserParameter.parse(query, {
      errors: { missingError: 'errors:invalidUser' },
      required: true
    }, { client, guild }))

    const titles = []

    if (guild && guild.ownerID === user.id) titles.push(`#crown`)
    if (user.bot) titles.push(`#bot`)

    const member = guild && guild.member(user)
    const nickname = member && member.nickname

    const presence = client.users.has(user.id) && user.presence
    const clientStatus = presence && presence.clientStatus
    const status = clientStatus && (clientStatus.desktop || clientStatus.mobile || clientStatus.web)

    const created = moment(user.createdAt)
    const joined = member && moment(member.joinedAt)

    const role = member && member.roles && member.roles.highest && (member.roles.highest.name !== '@everyone') && member.roles.highest
    const activity = presence && presence.activity
    const activityType = activity && activity.type && activity.name

    const embed = new Embed({ author, t, emoji, autoAuthor: false })
      .setAuthor(user)
      .setTitle(titles.join(' '))
      .setThumbnail(user)
      .addField('commands:userinfo.username', user.tag, true)

    if (nickname) embed.addField('commands:userinfo.nickname', nickname, true)

    embed.addField('commands:userinfo.id', user.id, true)

    if (status) embed.addField('commands:userinfo.status', `#${presence.status} $$utils:status.${presence.status}`, true)
    if (role) embed.addField('commands:userinfo.highestRole', role.name || role.toString(), true)
    if (activityType) embed.addField('» $$utils:activityType.' + activity.type, activity.name, true)

    embed.addField('commands:userinfo.createdAt', `${created.format('LL')} (${created.fromNow()})`)

    if (joined) embed.addField('commands:userinfo.joinedAt', `${joined.format('LL')} (${joined.fromNow()})`)

    // get Permissions
    const memberPermissions = member && member.permissions && member.permissions.toArray()
    const resultPermissions = memberPermissions &&
    (memberPermissions.includes(admPermission) ? t('permissions:' + admPermission) : memberPermissions.map(p => t('permissions:' + p)).join(', '))

    if (resultPermissions) embed.addField('» $$commands:userinfo.permissions', resultPermissions)
    const msg = await send(embed)

    const permissions = channel.permissionsFor(guild.me)
    const restriction = activity && (activity.type === 'LISTENING') && activity.party && activity.party.id && activity.party.id.includes('spotify:')

    if (permissions.has('ADD_REACTIONS') && restriction && !user.bot) {
      const spotifyEmoji = emoji('SPOTIFY', { id: true, othur: 'MUSIC' })
      const userinfoEmoji = emoji('PAGE', { id: true })
      const roleEmoji = emoji('ROLES', { id: true })

      await msg.react(userinfoEmoji)
      await msg.react(spotifyEmoji)
      if (member && member.roles && member.roles.size > 5) await msg.react(roleEmoji)

      const trackName = activity.details
      const artist = activity.state.split(';').join(',')
      const album = activity.assets && activity.assets.largeText
      const image = activity.assets && activity.assets.largeImage && `https://i.scdn.co/image/${activity.assets.largeImage.replace('spotify:', '')}`

      const spotifyEmbed = new Embed({ author, t })
        .setAuthor('commands:userinfo.spotify', SPOTIFY_LOGO_PNG_URL)
        .addField('commands:userinfo.track', trackName, true)
        .addField('commands:userinfo.artist', artist, true)
        .addField('commands:userinfo.album', album, true)
        .setColor('GREEN')

      if (image) spotifyEmbed.setThumbnail(image)

      const roles = member.roles.sort((a, b) => b.position - a.position).map(r => r.name || r.toString()).slice(0, -1)

      const roleEmbed = new Embed({ author, t })
        .setAuthor('commands:userinfo.roles', user.displayAvatarURL(), {}, { user: user.username})
        .setDescription(roles)

      const filter = (r, u) => r.me && author.id === u.id
      const collector = await msg.createReactionCollector(filter, { errors: ['time'], time: 30000 })

      collector.on('collect', async ({ emoji, users, message }) => {
        const name = emoji.id || emoji.name
        const checkEmbed = (e) => e.author.name === message.embeds[0].author.name

        if (permissions.has('MANAGE_MESSAGES')) await users.remove(user.id)
        if (name === spotifyEmoji && !checkEmbed(spotifyEmbed)) await msg.edit(spotifyEmbed)
        if (name === userinfoEmoji && !checkEmbed(embed)) await msg.edit(embed)
      })
      collector.on('end', async () => {
        if (msg && permissions.has('MANAGE_MESSAGES')) await msg.reactions.removeAll().catch(() => {})
      })
    }
  }
}

module.exports = UserInfo
