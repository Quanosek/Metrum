/* <--- Import ---> */

require('dotenv').config();
const { Permissions, MessageEmbed } = require('discord.js');

const msgAutoDelete = require('../../functions/msgAutoDelete.js');


/* <--- Command ---> */

module.exports = {
    name: 'forceskip',
    aliases: ['fs'],
    category: 'moderation',
    description: 'wymuszenie pominięcia utworu',

    async run(client, msg, args, prefix) {

        /* <--- moderation ---> */

        if (!msg.member.permissions.has(Permissions.FLAGS.MANAGE_MESSAGES) ||
            !msg.member.permissions.has(Permissions.FLAGS.MODERATE_MEMBERS)
        ) {
            msg.react('❌');
            msgAutoDelete(msg);

            return msg.channel.send({
                embeds: [new MessageEmbed()
                    .setColor(process.env.COLOR_ERR)
                    .setDescription('🛑 | Nie masz uprawnień do użycia tej komendy!')
                ]
            }).then(msg => msgAutoDelete(msg));
        };

        /* <--- errors ---> */

        const queue = client.distube.getQueue(msg);
        const botvoice = msg.guild.me.voice.channel
        const uservoice = msg.member.voice.channel

        if (!botvoice) {
            msg.react('❌');
            msgAutoDelete(msg);

            return msg.channel.send({
                embeds: [new MessageEmbed()
                    .setColor(process.env.COLOR_ERR)
                    .setDescription('Nie jestem na żadnym kanale głosowym!')
                ]
            }).then(msg => msgAutoDelete(msg));
        };

        if (!uservoice || botvoice != uservoice) {
            msg.react('❌');
            msgAutoDelete(msg);

            return msg.channel.send({
                embeds: [new MessageEmbed()
                    .setColor(process.env.COLOR_ERR)
                    .setDescription('Musisz być na kanale głosowym razem ze mną!')
                ]
            }).then(msg => msgAutoDelete(msg));
        };

        if (!queue) {
            msg.react('❌');
            msgAutoDelete(msg);

            return msg.channel.send({
                embeds: [new MessageEmbed()
                    .setColor(process.env.COLOR_ERR)
                    .setDescription('Obecnie nie jest odtwarzany żaden utwór!')
                ]
            }).then(msg => msgAutoDelete(msg));
        };

        /* <--- command ---> */

        msg.react('✅');

        if (queue.paused) client.distube.resume(msg);

        if (queue.songs.length < 2) {
            if (queue.autoplay) { client.distube.skip(msg) } else { client.distube.stop(msg) };
        } else { client.distube.skip(msg) };

        return msg.channel.send({
            embeds: [new MessageEmbed()
                .setColor(process.env.COLOR1)
                .setDescription('⏭️ | Pominięto utwór.')
            ]
        });

    }
};