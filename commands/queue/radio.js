/* <--- Import ---> */

require('dotenv').config();
const color_err = process.env.COLOR_ERR;
const color1 = process.env.COLOR1;
const color2 = process.env.COLOR2;

const { MessageEmbed } = require('discord.js');

const msgAutoDelete = require('../../functions/msgAutoDelete.js');


/* <--- Command ---> */

module.exports = {
    name: 'radio',
    aliases: ['r', 'autoplay', 'ap'],
    category: 'queue',
    description: 'autoodtwarzanie podobnych utworów (radio utowru)',

    async run(client, msg, args) {

        /* <--- errors ---> */

        const queue = client.distube.getQueue(msg);
        const botvoice = msg.guild.me.voice.channel;
        const uservoice = msg.member.voice.channel;

        if (!botvoice) {
            msg.react('❌');
            msgAutoDelete(msg);

            return msg.channel.send({
                embeds: [new MessageEmbed()
                    .setColor(color_err)
                    .setDescription('Nie jestem na żadnym kanale głosowym!')
                ]
            }).then(msg => msgAutoDelete(msg));
        };

        if (!uservoice || botvoice != uservoice) {
            msg.react('❌');
            msgAutoDelete(msg);

            return msg.channel.send({
                embeds: [new MessageEmbed()
                    .setColor(color_err)
                    .setDescription('Musisz być na kanale głosowym razem ze mną!')
                ]
            }).then(msg => msgAutoDelete(msg));
        };

        if (!queue) {
            msg.react('❌');
            msgAutoDelete(msg);

            return msg.channel.send({
                embeds: [new MessageEmbed()
                    .setColor(color_err)
                    .setDescription('Obecnie nie jest odtwarzany żaden utwór!')
                ]
            }).then(msg => msgAutoDelete(msg));
        };

        /* <--- command ---> */

        msg.react('✅');

        const mode = client.distube.toggleAutoplay(msg);

        return msg.channel.send({
            embeds: [new MessageEmbed()
                .setColor(color1)
                .setDescription('📻 | ' + (mode ? '**Włączono**' : '**Wyłączono**') + ' autoodtwarzanie (radio utworu).')
            ]
        });

    }
};