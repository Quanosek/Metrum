/** IMPORT */

require('dotenv').config();
const { COLOR_ERR, COLOR1, COLOR2 } = process.env;

const { MessageEmbed } = require('discord.js');

/** RADIO SLASH COMMAND */

module.exports = {
    name: 'radio',
    description: 'Auto-odtwarzanie podobnych utworów (radio utworu)',

    options: [{
        name: 'mode',
        description: 'Wybierz tryb działania radia',
        type: 'NUMBER',
        choices: [
            { name: 'enable', value: 1 },
            { name: 'disable', value: 0 }
        ],
    }],

    async run(client, msgInt) {

        /** DEFINE */

        if (msgInt.type === 'APPLICATION_COMMAND') choice = msgInt.options.getNumber('mode');

        const queue = client.distube.getQueue(msgInt);
        const botvoice = msgInt.guild.me.voice.channel;
        const uservoice = msgInt.member.voice.channel;

        /** ERRORS */

        const errorEmbed = new MessageEmbed() // create embed
            .setColor(COLOR_ERR)

        if (!botvoice)
            errorEmbed.setDescription('Nie jestem na żadnym kanale głosowym!');
        else if (!uservoice || botvoice != uservoice)
            errorEmbed.setDescription('Musisz być na kanale głosowym **razem ze mną**!');
        else if (!queue)
            errorEmbed.setDescription('Obecnie nie jest odtwarzany żaden utwór!');

        if (errorEmbed.description) // print error embed
            return msgInt.reply({ embeds: [errorEmbed], ephemeral: true });

        /** COMMAND */

        let mode = client.distube.toggleAutoplay(msgInt);

        // execute command

        if (msgInt.type === 'APPLICATION_COMMAND') { // slash command

            if (isNaN(choice)) {
                mode = mode ? '**Włączono**' : '**Wyłączono**';

            } else {
                queue.autoplay = choice;
                if (choice === 0) mode = '**Wyłączono**';
                if (choice === 1) mode = '**Włączono**';
            };

            radioText = '📻 | ' + mode + ' auto-odtwarzanie (radio utworu).'

        } else { // button interaction

            mode = mode ? '**włączył(a)**' : '**wyłączył(a)**';
            radioText = `📻 | ${msgInt.member.user} ` + mode + ` auto-odtwarzanie (radio utworu).`
        };

        // print command message

        return msgInt.reply({
            embeds: [new MessageEmbed()
                .setColor(COLOR1)
                .setDescription(radioText)
            ],
        });

    },
};