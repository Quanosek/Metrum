/* <--- Import ---> */

require('dotenv').config();
const color_err = process.env.COLOR_ERR;
const color1 = process.env.COLOR1;
const color2 = process.env.COLOR2;

const { Permissions, MessageEmbed } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

const msgAutoDelete = require('../../functions/msgAutoDelete.js');


/* <--- Command ---> */

module.exports = {
    name: 'stop',
    aliases: ['st', 'destroy', 'break'],
    category: 'admin',
    description: 'zatrzymanie awaryjne bota',

    async run(client, msg, args) {

        /* <--- admin ---> */

        if (!msg.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            msg.react('❌');
            msgAutoDelete(msg);

            return msg.channel.send({
                embeds: [new MessageEmbed()
                    .setColor(color_err)
                    .setDescription('🛑 | Nie masz uprawnień do użycia tej komendy!')
                ]
            }).then(msg => msgAutoDelete(msg));
        };

        /* <--- errors ---> */

        const botvoice = msg.guild.me.voice.channel
        const uservoice = msg.member.voice.channel

        if (botvoice && (!uservoice || botvoice != uservoice)) {
            msg.react('❌');
            msgAutoDelete(msg);

            return msg.channel.send({
                embeds: [new MessageEmbed()
                    .setColor(color_err)
                    .setDescription('Musisz być na kanale głosowym razem ze mną!')
                ]
            }).then(msg => msgAutoDelete(msg));
        };

        /* <--- command ---> */

        msg.react('✅');
        msgAutoDelete(msg);

        const connection = getVoiceConnection(msg.guild.id)
        connection.destroy();

        client.distube.stop(msg)

        return msg.channel.send({
            embeds: [new MessageEmbed()
                .setColor(color1)
                .setDescription('✋ | Zatrzymano awaryjnie bota.')
            ]
        }).then(msg => msgAutoDelete(msg));

    }
};