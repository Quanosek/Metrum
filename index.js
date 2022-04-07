/* <--- Import ---> */

const fs = require('fs');
const clr = require('colors');

const config = require('./bot/config.js').config();
const Website = require('./functions/website.js');
const msgAutoDelete = require('./functions/msgAutoDelete.js')
const realDate = require('./functions/realDate.js')


/* <--- Start ---> */

console.log(`> ` + clr.brightCyan(`[${realDate()}]`) + ` ${config.name} starting up...`);
Website();


/* <--- Client ---> */

const { Client, Intents, Collection, MessageEmbed } = require('discord.js');
const intents = new Intents(32767);
const client = new Client({
  shards: 'auto',
  restTimeOffset: 0,
  intents
});


/* <--- Distube ---> */

const DisTube = require('distube')
const { SoundCloudPlugin } = require('@distube/soundcloud')
const { SpotifyPlugin } = require('@distube/spotify')

client.distube = new DisTube.default(client, {
  plugins: [new SoundCloudPlugin(), new SpotifyPlugin()],
  emitNewSongOnly: true,
  leaveOnStop: false,
  updateYouTubeDL: false,
  ytdlOptions: {
    quality: "highestaudio",
    format: "audioonly",
  },
  emptyCooldown: 10,
  nsfw: true
});

client.distube.setMaxListeners(99);


/* <--- Handlers ---> */

// commands

const commandFolders = fs.readdirSync('./commands');
client.commands = new Collection();

for (const folder of commandFolders) {

  const commandFiles = fs
    .readdirSync(`./commands/${folder}`)
    .filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  };
};

// client events

client.events = new Collection();

fs
  .readdirSync('./client events/')
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const event = require(`./client events/${file}`);
    client.on(event.name, (...args) => event.execute(client, ...args));
  });


/* <--- Distube events ---> */

client.distube

  // addList

  .on('addList', (queue, playlist) => {

    let songs;
    let rest = playlist.songs.length % 10;

    if (playlist.songs.length === 1) songs = 'utwór'
    else if (rest < 2 || rest > 4) songs = 'utworów'
    else if (rest > 1 || rest < 5) songs = 'utwory'

    return queue.textChannel.send({
      embeds: [new MessageEmbed()
        .setColor(config.color1)
        .setTitle('➕ | Dodano do kolejki playlistę:')
        .setDescription(`
\`${playlist.name}\`
\n**łącznie ${playlist.songs.length} ${songs}**!
        `)
        .setThumbnail(playlist.thumbnail)
        .setFooter(`${prefix}queue wyświetla obecną kolejkę`)
        .setTimestamp()
      ]
    });

  })

  // addSong

  .on('addSong', (queue, song) => {

    if (queue.songs.length < 2) return;

    return queue.textChannel.send({
      embeds: [new MessageEmbed()
        .setColor(config.color1)
        .setTitle('➕ | Dodano do kolejki:')
        .setDescription(`
[${song.name}](${song.url}) - \`${song.formattedDuration}\`
        `)
        .setThumbnail(song.thumbnail)
        .setFooter(`${prefix}queue wyświetla obecną kolejkę`)
        .setTimestamp()
      ]
    });

  })

  // error

  .on('error', (channel, err) => {

    return channel.send({
      embeds: [new MessageEmbed()
        .setColor(config.color_err)
        .setDescription(`${err}`)
      ]
    }).then(msg => msgAutoDelete(msg, 20));

  })

  // initQueue

  .on('initQueue', (queue) => {

    queue.paused = false;
    queue.autoplay = false;
    queue.loop = 2;
    queue.volume = 100;

  })

  // noRelated

  .on('noRelated', (queue) => {

    return queue.textChannel.send({
      embeds: [new MessageEmbed()
        .setColor(config.color_err)
        .setDescription('Nie znaleziono podobnych utworów.')
      ]
    }).then(msg => msgAutoDelete(msg));

  })

  // playSong

  .on('playSong', (queue, song) => {

    client.distube.setSelfDeaf

    return queue.textChannel.send({
      embeds: [new MessageEmbed()
        .setColor(config.color2)
        .setTitle('🎶 | Teraz odtwarzane:')
        .setDescription(`
[${song.name}](${song.url}) - \`${song.formattedDuration}\`
        `)
        .setThumbnail(`${song.thumbnail}`)
        .setFooter(`${prefix}queue wyświetla obecną kolejkę`)
        .setTimestamp()
      ]
    });

  })

  // searchNoResult

  .on('searchNoResult', (msg, query) => {

    return msg.channel.send({
      embeds: [new MessageEmbed()
        .setColor(config.color_err)
        .setDescription(`Nie znaleziono utworów dla: \`${query}\``)
      ]
    });

  });


/* <--- Token ---> */

client.login(process.env['TOKEN']);