require('dotenv').config();

const fs = require('fs');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');
const client = require('./config.js');

const token = process.env.BOT_TOKEN;
const channelId = process.env.CHANNEL_ID;
const guildId = process.env.GUILD_ID;

const player = createAudioPlayer();
const playedFiles = []; // Stocke les fichiers audio déjà joués

client.once('ready', () => {
    const channel = client.channels.cache.get(channelId);

    if (!channel) return;

    const connection = joinVoiceChannel({
        channelId: channelId,
        guildId: guildId,
        adapterCreator: channel.guild.voiceAdapterCreator,
        selfDeaf: false,
        selfMute: false,
    });

    playRandomAudio();

    player.on('stateChange', (oldState, newState) => {
        if (newState.status === 'idle') {
            playRandomAudio();
        }
    });

    function playRandomAudio() {
        const files = fs.readdirSync('./assets/music/').filter(file => file.endsWith('.mp3'));

        const availableFiles = files.filter(file => !playedFiles.includes(file));

        if (availableFiles.length === 0) {
            playedFiles.length = 0;
            return playRandomAudio();
        }

        const randomIndex = Math.floor(Math.random() * availableFiles.length);
        const selectedFile = availableFiles[randomIndex];

        const resource = createAudioResource(`./assets/music/${selectedFile}`, {
            inputType: StreamType.Arbitrary,
        });

        player.play(resource);
        connection.subscribe(player);
        playedFiles.push(selectedFile);
    }
});

client.login(token);
