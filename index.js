const Discord = require("discord.js");
const Distube = require("distube").default;
const config = require("./config.json");
const client = new Discord.Client({
  intents: 641,
});

const distube = new Distube(client, {
  emitNewSongOnly: false,
  searchSongs: 0,
});

client.on("ready", () => {
  console.log(`Your Music is Playing...`);
  client.user.setActivity("Your Songs", { type: "PLAYING" });
});

// distube events
distube.on("playSong", (queue, song) => {
  queue.textChannel.send(`🎵 Playing \`${song.name}\``);
});
distube.on("addSong", (queue, song) => {
  queue.textChannel.send(
    `Added to Queue \`${song.name}\` \`${song.formattedDuration}\``
  );
});
client.on("messageCreate", async (message) => {
  if (
    !message.guild ||
    message.author.bot ||
    !message.content.startsWith(config.prefix)
  )
    return;

  let args = message.content.slice(config.prefix.length).trim().split(" ");
  let cmd = args.shift()?.toLowerCase();
  if (cmd === "ping") {
    message.channel.send(`>>> Ping :- \`${client.ws.ping}\``);
  } else if (cmd === "play") {
    let search = args.join(" ");
    let channel = message.member.voice.channel;
    let queue = distube.getQueue(message.guildId);
    if (!channel) {
      return message.reply(`>>> Please Join a Voice Channel`);
    }
    if (!search) {
      return message.reply(`>>> Please Provide me Song name or Link`);
    }
    distube.play(message, search);
  } else if (cmd === "skip") {
    let queue = distube.getQueue(message.guildId);
    if (!message.guild.me.voice.channel) {
      return message.reply(`>>> Nothing Playing`);
    }
    queue.skip();
  } else if (cmd === "volume") {
    let amount = parseInt(args[0]);
    let queue = distube.getQueue(message.guild.id);
    queue.setVolume(amount)
    message.channel.send(`>>> Volume set to ${amount}`);
  }
});
client.login(config.token);
