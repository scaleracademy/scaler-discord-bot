const Discord = require("discord.js");
const config = require("./config.json");
const axios = require('axios');
const Canvas = require('canvas');

const client = new Discord.Client({ intents: [Discord.Intents.FLAGS.GUILDS, Discord.Intents.FLAGS.GUILD_MESSAGES], });

const prefix = "!";

client.once('ready', () => {
    console.log('Ready!');
});

client.on("messageCreate", async function (message) {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;

    const commandBody = message.content.slice(prefix.length);
    const args = commandBody.split(' ');
    const command = args.shift().toLowerCase();
    if (command === "ping") {
        const timeTaken = Date.now() - message.createdTimestamp;
        message.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
    }
    if (command === "meme") {
        message.channel.send("Here's your meme!");
        const img = await getMeme();
        message.channel.send(img);
    }
    if (command === "server") {
        if (message.guild) {
            let admins = "";
            message.guild.members.cache.array().forEach(member => {
                if (member.hasPermission("ADMINISTRATOR")) {
                    admins += member.displayName + ", ";
                }
            });
            admins = admins.slice(0, admins.lastIndexOf(","));
            const embed = {
                embed: {
                    color: 3447003,
                    title: message.guild.name,
                    thumbnail: {
                        url: message.guild.iconURL()
                    },
                    fields: [
                        {
                            name: "Admins",
                            value: admins
                        },
                        {
                            name: "Creation Date",
                            value: `${message.guild.createdAt.toDateString()} at ${message.guild.createdAt.toTimeString()}`
                        },
                        {
                            name: "Channel Count",
                            value: message.guild.channels.cache.size
                        },
                        {
                            name: "Member Count",
                            // Filter the members list to only include non-bots
                            value: message.guild.members.cache.filter(member => !member.user.bot)
                                .size
                        },
                        {
                            name: "Bot Count",
                            // Filter the list to only include bots
                            value: message.guild.members.cache.filter(member => member.user.bot)
                                .size
                        }
                    ],
                    timestamp: new Date(),
                    footer: {
                        text: `ID: ${message.guild.id}`
                    }
                }
            };
            return message.channel.send(embed);
        }
        else {
            // The message was sent in a DM, can't retrieve the server info
            return message.reply(
                "Looks like you didn't send this message from a server"
            );
        }
    }
    // if (command === "profile") {
    // message.channel.send(`Your avatar: <${message.author.displayAvatarURL({ format: 'png', dynamic: true })}>`);
    // console.log(message.guild.members);
    // let member = message.guild.member(message.mentions.users.first());

    // // Check we were able to retrieve the member (member is undefined)
    // if (!member) {
    //     return message.reply(
    //         `I couldn't find a user with the ID \`${args[0]}\``
    //     );
    // }

    // // Format Permissions
    // const permissions = member.permissions.toArray().map(perm => {
    //     return perm
    //         .toLowerCase()
    //         .replace(/_/g, " ") // Replace all underscores with spaces
    //         .replace(/\w\S*/g, txt => {
    //             // Capitalize the first letter of each word
    //             return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    //         });
    // });

    // // Calculate Join Position
    // let joinPosition;
    // const members = message.guild.members.cache.array();
    // members.sort((a, b) => a.joinedAt - b.joinedAt);
    // for (let i = 0; i < members.length; i++) {
    //     if (members[i].id == message.guild.member(message.author).id)
    //         joinPosition = i;
    // }

    // // Construct Reply
    // const embed = {
    //     embed: {
    //         color: 3447003,
    //         title: `${member.user.tag}`,
    //         thumbnail: {
    //             url: member.user.avatarURL()
    //         },
    //         description: `${member.displayName}`,
    //         fields: [
    //             {
    //                 name: "Joined",
    //                 value: `${member.joinedAt.toDateString()} at ${member.joinedAt.toTimeString()}`
    //             },
    //             {
    //                 name: "Join Position",
    //                 value: joinPosition
    //             },
    //             {
    //                 name: "Permissions",
    //                 value: permissions.join(", ")
    //             }
    //         ],
    //         timestamp: new Date(),
    //         footer: {
    //             text: `ID: ${member.id}`
    //         }
    //     }
    // };

    // message.channel.send(embed);

    // }
});

client.on('interactionCreate', async message => {
    console.log("message")
    if (!message.isCommand()) return;

    if (message.commandName === 'profile') {
        const canvas = Canvas.createCanvas(700, 250);
        const context = canvas.getContext('2d');

        const background = await Canvas.loadImage('assets/images/background.png');
        context.drawImage(background, 0, 0, canvas.width, canvas.height);

        context.strokeStyle = '#0099ff';
        context.strokeRect(0, 0, canvas.width, canvas.height);

        context.font = '28px sans-serif';
        context.fillStyle = '#ffffff';
        context.fillText('Profile', canvas.width / 2.5, canvas.height / 3.5);

        context.font = applyText(canvas, `${message.member.displayName}!`);
        context.fillStyle = '#ffffff';
        context.fillText(`${message.member.displayName}!`, canvas.width / 2.5, canvas.height / 1.8);

        context.beginPath();
        context.arc(125, 125, 100, 0, Math.PI * 2, true);
        context.closePath();
        context.clip();

        const avatar = await Canvas.loadImage(message.user.displayAvatarURL({ format: 'png' }));
        context.drawImage(avatar, 25, 25, 200, 200);

        const attachment = new MessageAttachment(canvas.toBuffer(), '/assets/images/scaler-logo.png');

        message.reply({ files: [attachment] });
    }
});

/// helper function ///
async function getMeme() {
    const res = await axios.get('https://memeapi.pythonanywhere.com/');
    return res.data.memes[0].url;
}

const applyText = (canvas, text) => {
    const context = canvas.getContext('2d');
    let fontSize = 70;

    do {
        context.font = `${fontSize -= 10}px sans-serif`;
    } while (context.measureText(text).width > canvas.width - 300);

    return context.font;
};

client.login(config.BOT_TOKEN);
