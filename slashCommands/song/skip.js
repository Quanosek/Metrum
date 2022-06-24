/** IMPORT */

require('dotenv').config();
const { COLOR_ERR, COLOR1, COLOR2 } = process.env;

const { MessageEmbed } = require('discord.js');

/** SKIP SLASH COMMAND */

let skipVotes = []; // votes

module.exports = {
    name: 'skip',
    description: 'Pominięcie obecnie granego utworu (głosowanie)',

    async run(client, msgInt) {

        const queue = client.distube.getQueue(msgInt);
        const botvoice = msgInt.guild.me.voice.channel;
        const uservoice = msgInt.member.voice.channel;

        /** COMMON ERRORS */

        if (!botvoice) {

            return msgInt.reply({
                embeds: [new MessageEmbed()
                    .setColor(COLOR_ERR)
                    .setDescription('Nie jestem na żadnym kanale głosowym!')
                ],
                ephemeral: true,
            });
        };

        if (!uservoice || botvoice != uservoice) {

            return msgInt.reply({
                embeds: [new MessageEmbed()
                    .setColor(COLOR_ERR)
                    .setDescription('Musisz być na kanale głosowym razem ze mną!')
                ],
                ephemeral: true,
            });
        };

        if (!queue) {

            return msgInt.reply({
                embeds: [new MessageEmbed()
                    .setColor(COLOR_ERR)
                    .setDescription('Obecnie nie jest odtwarzany żaden utwór!')
                ],
                ephemeral: true,
            });
        };

        /** VOTING SYSTEM */

        let users = uservoice.members.size;

        uservoice.members.forEach(member => {
            if (member.user.bot) users = users - 1;
        });

        const required = Math.ceil(users / 2);

        /** error */

        if (skipVotes.some((x) => x === msgInt.member.user.id)) {

            return msgInt.reply({
                embeds: [new MessageEmbed()
                    .setColor(COLOR_ERR)
                    .setDescription(`🗳️ | Już oddał*ś swój głos!`)
                ],
                ephemeral: true,
            });
        };

        // translation

        let votes, rest = votes % 10;
        if (rest > 1 || rest < 5) votes = 'głosy'
        else if (rest < 2 || rest > 4) votes = 'głosów'

        let voteText, skipText;

        if (msgInt.type === 'APPLICATION_COMMAND') {
            voteText = `🗳️ | Głosujesz za **pominięciem** utworu (**${skipVotes.length}**/${required} ${votes})`
            skipText = '⏭️ | Pominięto utwór.'
        } else { // button interaction
            voteText = `🗳️ | ${msgInt.member.user} głosuje za **pominięciem** utworu (**${skipVotes.length}**/${required} ${votes})`
            skipText = `⏭️ | ${msgInt.member.user} pominął/pominęła utwór.`
        };

        /** voting */

        skipVotes.push(msgInt.member.user.id);
        process.setMaxListeners(Infinity);

        if (required > 1) {

            msgInt.reply({
                embeds: [new MessageEmbed()
                    .setColor(COLOR2)
                    .setDescription(voteText)
                ],
            });
        };

        /** COMMAND */

        if (skipVotes.length >= required) {

            if (queue.paused) client.distube.resume(msgInt);

            if (queue.songs.length < 2) {
                if (queue.autoplay) client.distube.skip(msgInt);
                else client.distube.stop(msgInt);
            } else client.distube.skip(msgInt);

            msgInt.reply({
                embeds: [new MessageEmbed()
                    .setColor(COLOR1)
                    .setDescription(skipText)
                ],
            });

            return skipVotes = [];
        };

        /** EVENT */

        client.distube.on('playSong', (queue, song) => {
            return skipVotes = [];
        });

    },
};