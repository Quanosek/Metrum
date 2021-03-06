/** IMPORT */

require('dotenv').config();
const { NAME, TOKEN, COLOR_ERR, COLOR1, COLOR2, MONGO_URI } = process.env;

require('colors');
const fs = require('fs');
const mongoose = require('mongoose');

const autoDelete = require('./functions/autoDelete.js')
const realDate = require('./functions/realDate.js')

/** ON RUN */

console.clear(); // start with clear terminal
console.log(realDate() + ' Bot ' + `${NAME}`.brightYellow + ' is starting up...'); // log

/** MAIN DEFINE */

const { Client, MessageEmbed } = require('discord.js');

const client = new Client({ // define client
    intents: 32767,
    restTimeOffset: 0,
    shards: 'auto',
});

/** handlers define */

const handlers = fs
    .readdirSync('./handlers')
    .filter(file => file.endsWith('.js'));

/** MAIN FUNCTION */

(async() => {

    /** handlers run*/

    for (file of handlers) {
        require(`./handlers/${ file }`)(client);
    };

    client.handleEvents('clientEvents');
    client.handleButtons('buttons');
    client.handleSlashCommands('slashCommands');
    client.handleCommands('commands');

    /** mongoose connection */

    try {
        if (!MONGO_URI) return;
        await mongoose.connect(MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).then(() => console.log(realDate() + ' Successfully connected to the database.'));
    } catch (err) {
        if (err) return console.error(` >>> [MONGODB] ${err}`.brightRed);
    };

})();

/** DISCORD TOGETHER */

const { DiscordTogether } = require('discord-together');
client.discordTogether = new DiscordTogether(client);

/** DISTUBE DEFINE */

const { DisTube } = require('distube');
const { YtDlpPlugin } = require('@distube/yt-dlp');
const { SoundCloudPlugin } = require('@distube/soundcloud');
const { SpotifyPlugin } = require('@distube/spotify');

client.distube = new DisTube(client, {
    plugins: [new YtDlpPlugin(), new SoundCloudPlugin(), new SpotifyPlugin()],
    emitNewSongOnly: true,
    leaveOnStop: false,
    searchSongs: 10,
    youtubeDL: false,
    nsfw: true,
});

client.distube.setMaxListeners(99);

/** DISTUBE EVENTS */

client.distube

    .on('addList', (queue, playlist) => {

    const rest = playlist.songs.length % 10;
    if (playlist.songs.length === 1) songs = 'utw??r'
    else if (rest < 2 || rest > 4) songs = 'utwor??w'
    else if (rest > 1 || rest < 5) songs = 'utwory'

    let color = COLOR1,
        source = '',
        tracks = `\nliczba utwor??w: \`${playlist.songs.length}\`\n`

    if (playlist.source === 'youtube')
        color = '#ff0000', source = ' YouTube';
    if (playlist.source === 'spotify')
        color = '#1ed760', source = ' Spotify', tracks = '';
    if (playlist.source === 'soundcloud')
        color = '#ff5500', source = ' SoundCloud';

    const embed = new MessageEmbed()
        .setColor(color)
        .setThumbnail(playlist.thumbnail)
        .setTitle(`??? | Dodano do kolejki playlist??${source}:`)
        .setDescription(`
[${playlist.name}](${playlist.url})
${tracks}
        `)
        .setFooter({ text: `Aby dowiedzie?? si?? wi??cej o obecnej kolejce u??yj komendy: queue` })

    return queue.textChannel.send({ embeds: [embed] });
})

.on('addSong', (queue, song) => {

    if (queue.songs.length < 2) return;

    const embed = new MessageEmbed()
        .setColor(COLOR2)
        .setThumbnail(song.thumbnail)

    if (queue.added) {

        queue.added = false;
        embed.setTitle('??? | Dodano do kolejki jako nast??pny:');
        embed.setDescription(`**2.** [${song.name}](${song.url}) - \`${song.formattedDuration}\``);

        if (queue.songs.length > 2) embed.setFooter({ text: `Utwor??w w kolejce: ${queue.songs.length}` });

    } else {

        embed.setTitle('??? | Dodano do kolejki:');
        embed.setDescription(`**${queue.songs.length}.** [${song.name}](${song.url}) - \`${song.formattedDuration}\``);

        if (queue.songs.length) embed.setFooter({ text: `Aby dowiedzie?? si?? wi??cej o obecnej kolejce u??yj komendy: queue` });
    };

    return queue.textChannel.send({ embeds: [embed] })
})

.on("error", (channel, err) => {

    console.error(` >>> [DISTUBE] ${err}`.brightRed);

    return channel.send({
        embeds: [new MessageEmbed()
            .setColor(COLOR_ERR)
            .setDescription(`${err}`)
        ],
    }).then(msg => autoDelete(msg));
})

.on('noRelated', (queue) => {

    return queue.textChannel.send({
        embeds: [new MessageEmbed()
            .setColor(COLOR_ERR)
            .setDescription('Nie znaleziono podobnych utwor??w.')
        ],
    }).then(msg => autoDelete(msg));
})

.on('playSong', (queue, song) => {

    client.distube.setSelfDeaf;
    let requester = song.member.user;

    return queue.textChannel.send({
        embeds: [new MessageEmbed()
            .setColor(COLOR2)
            .setThumbnail(`${song.thumbnail}`)
            .setTitle('???? | Teraz odtwarzane:')
            .setDescription(`[${song.name}](${song.url}) - \`${song.formattedDuration}\``)
            .setFooter({ text: `doda??(a): ${requester.username}`, iconURL: `${requester.displayAvatarURL()}` })
        ],
    });
})

/** TOKEN */

client.login(TOKEN);