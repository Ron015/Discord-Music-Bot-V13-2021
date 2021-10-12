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

const status = (queue) =>
  `Volume: \`${queue.volume}%\` | Filter: \`${
    queue.filter || "Off"
  }\` | Loop: \`${
    queue.repeatMode
      ? queue.repeatMode == 2
        ? "All Queue"
        : "This Song"
      : "Off"
  }\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;

// distube events
distube.on("playSong", (queue, song) => {
  let playembed = new Discord.MessageEmbed()
    .setColor("BLURPLE")
    .setTitle(`🎵 Playing `)
    .setThumbnail(song.thumbnail)
    .setDescription(`[${song.name}](${song.url})`)
    .addField("Requested By", `${song.user}`, true)
    .addField("Duration", `${song.formattedDuration.toString()}`, true)
    .setFooter(status(queue), song.user.displayAvatarURL({ dynamic: true }));

  queue.textChannel.send({ embeds: [playembed] });
});
distube.on("addSong", (queue, song) => {
  let playembed = new Discord.MessageEmbed()
    .setColor("BLURPLE")
    .setTitle(`🎵 Added to Queue `)
    .setThumbnail(song.thumbnail)
    .setDescription(`[${song.name}](${song.url})`)
    .addField("Requested By", `${song.user}`, true)
    .addField("Duration", `${song.formattedDuration.toString()}`, true)
    .setFooter(
      `Coded By Kabir Singh`,
      song.user.displayAvatarURL({ dynamic: true })
    );

  queue.textChannel.send({ embeds: [playembed] });
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
      return message.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setColor("BLURPLE")
            .setDescription(`>>> Please Join a Voice Channel`)
            .setFooter(
              `Coded By Kabir Singh`,
              message.author.displayAvatarURL({ dynamic: true })
            ),
        ],
      });
    }
    // if (message.guild.me.voice.channel !== channel) {
    //   return message.reply({
    //     embeds: [
    //       new Discord.MessageEmbed()
    //         .setColor("BLURPLE")
    //         .setDescription(`>>> Please Join My Voice Channel to Play Song`)
    //         .setFooter(
    //           `Coded By Kabir Singh`,
    //           message.author.displayAvatarURL({ dynamic: true })
    //         ),
    //     ],
    //   });
    // }
    if (!search) {
      return message.reply({
        embeds: [
          new Discord.MessageEmbed()
            .setColor("BLURPLE")
            .setDescription(`>>> Please Provide me Song name or Link`)
            .setFooter(
              `Coded By Kabir Singh`,
              message.author.displayAvatarURL({ dynamic: true })
            ),
        ],
      });
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
    queue.setVolume(amount);
    message.channel.send(`>>> Volume set to ${amount}`);
  }
});
client.login(config.token);
