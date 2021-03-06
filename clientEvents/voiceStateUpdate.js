/** IMPORT */

require('dotenv').config();
const { CLIENT_ID } = process.env;

require('colors');

const realDate = require('../functions/realDate.js');

/** VOICE STATE UPDATE EVENT */

module.exports = {
    name: 'voiceStateUpdate',

    async run(client, oldState, newState) {

        if (oldState.id === CLIENT_ID) {

            if (!oldState.channelId && newState.channelId) {
                console.log(realDate() + ` Guild: ${oldState.guild.name}, ID: ${oldState.guild.id}`.grey + `\n >>> Bot ` + `joined`.brightGreen + ` the voice channel.`);

            } else if (!newState.channelId) {
                console.log(realDate() + ` Guild: ${newState.guild.name}, ID: ${newState.guild.id}`.grey + `\n >>> Bot ` + `left`.brightRed + ` the voice channel.`);

            };
        };

    },
};