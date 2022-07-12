/** IMPORT */

require('dotenv').config();
const { COLOR_ERR, COLOR1, COLOR2 } = process.env;

require('colors');
const { MessageEmbed } = require('discord.js');

const autoDelete = require('../../functions/autoDelete.js');

/** ADD COMMAND */

module.exports = {
    name: 'add',
    aliases: ['ad'],
    description: 'Dodanie podanego utworu jako następny w kolejce (podaj tytuł utworu lub wklej dowolny link)',
    permissions: ['MANAGE_MESSAGES'],

    async run(client, prefix, msg, args) {

        /** DEFINE */

        const song = args.join(' ');

        const queue = client.distube.getQueue(msg);
        const botvoice = msg.guild.me.voice.channel;
        const uservoice = msg.member.voice.channel;

        /** ERRORS */

        const errorEmbed = new MessageEmbed() // create embed
            .setColor(COLOR_ERR)

        if (!uservoice)
            errorEmbed.setDescription('Musisz najpierw **dołączyć** na kanał głosowy!');
        else if (uservoice.id === msg.guild.afkChannel.id)
            errorEmbed.setDescription(`Jesteś na kanale **AFK**!`);

        else if (botvoice) {
            if (botvoice.members.size === 1) {
                try {
                    client.distube.voices.get(msg).leave();
                } catch (err) {
                    if (err) console.error(` >>> ${err}`.brightRed);
                };
            } else if (queue && uservoice != botvoice)
                errorEmbed.setDescription('Musisz być na kanale głosowym **razem ze mną**!');

        } else if (!song)
            errorEmbed.setDescription(`Musisz jeszcze wpisać **tytuł utworu**, albo wkleić **dowolny link**!`);

        else if (!(uservoice.permissionsFor(msg.guild.me).has('VIEW_CHANNEL') || uservoice.permissionsFor(msg.guild.me).has('CONNECT')))
            errorEmbed.setDescription(`**Nie mam dostępu** do kanału głosowego, na którym jesteś!`);
        else if (!(uservoice.permissionsFor(msg.guild.me).has('SPEAK')))
            errorEmbed.setDescription(`**Nie mam uprawnień** do aktywności głosowej na twoim kanale!`);

        if (errorEmbed.description) { // print error embed
            msg.react('❌'), autoDelete(msg);
            return msg.channel.send({ embeds: [errorEmbed] }).then(msg => autoDelete(msg));
        };

        /** COMMAND */

        // print command message

        msg.react('✅');

        if (!(
                msg.content.includes('youtu.be/') ||
                msg.content.includes('youtube.com/') ||
                msg.content.includes('open.spotify.com/') ||
                msg.content.includes('soundcloud.com/')
            )) {

            msg.channel.send({
                embeds: [new MessageEmbed()
                    .setColor(COLOR1)
                    .setDescription(`🔍 | **Szukam:** \`${song}\`, może to chwilę zająć...`)
                ],
            });
        };

        // execute command

        if (queue) queue.added = true;
        return client.distube.play(uservoice, song, {
            msg,
            textChannel: msg.channel,
            member: msg.member,
            position: 1,
        });

    },
};