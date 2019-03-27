const { Command, Embed, Constants: { SPOTIFY_LOGO_PNG_URL }, Parameters: { UserParameter } } = require('../../')
const moment = require('moment')

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

    const member = guild && guild.member(user)

    const presence = client.users.has(user.id) && user.presence
    const clientStatus = presence && presence.clientStatus
    const status = clientStatus && (clientStatus.desktop || clientStatus.mobile || clientStatus.web)

    const created = moment(user.createdAt)
    const joined = member && moment(member.joinedAt)

    const embed = new Embed({ author, t, emoji, autoAuthor: false })
      .setAuthor(user.tag, user.displayAvatarURL())
      .setThumbnail(user.displayAvatarURL())
      .addField('commands:userinfo.username', user.tag, true)

    if (member && member.nickname) embed.addField('commands:userinfo.nickname', member.nickname, true)

    embed.addField('commands:userinfo.id', user.id, true)

    if (status) embed.addField('commands:userinfo.status', `#${presence.status} $$utils:status.${presence.status}`, true)

    const role = member && member.roles && member.roles.highest && member.roles.highest
    if (role && role.name !== '@everyone') embed.addField('commands:userinfo.highestRole', role.name, true)

    embed.addField('commands:userinfo.createdAt', `${created.format('LL')} (${created.fromNow()})`, true)

    if (joined) embed.addField('commands:userinfo.joinedAt', `${joined.format('LL')} (${joined.fromNow()})`, true)

    const activity = presence && presence.activity

    if (activity && activity.type && activity.name) embed.addField('utils:activityType.' + activity.type, activity.name, true)

    const msg = await send(embed)

    const perms = channel.permissionsFor(guild.me)
    const restriction = activity && (activity.type === 'LISTENING') && activity.party && activity.party.id && activity.party.id.includes('spotify:')

    if (perms.has('ADD_REACTIONS') && restriction && !user.bot) {
      const spotifyEmoji = emoji('SPOTIFY', { id: true, othur: 'MUSIC' })
      const userinfoEmoji = emoji('PAGE', { id: true })

      await msg.react(spotifyEmoji)
      await msg.react(userinfoEmoji)

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

      const filter = (r, u) => r.me && author.id === u.id
      const collector = await msg.createReactionCollector(filter, { errors: ['time'], time: 30000 })

      collector.on('collect', async ({ emoji, users, message }) => {
        const name = emoji.id || emoji.name
        const checkEmbed = (e) => e.author.name === message.embeds[0].author.name

        if (perms.has('MANAGE_MESSAGES')) await users.remove(user.id)
        if (name === spotifyEmoji && !checkEmbed(spotifyEmbed)) await msg.edit(spotifyEmbed)
        if (name === userinfoEmoji && !checkEmbed(embed)) await msg.edit(embed)
      })
      collector.on('end', () => {
        if (msg) msg.reactions.removeAll()
      })
    }
  }
}

module.exports = UserInfo
