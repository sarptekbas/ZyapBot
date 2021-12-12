/*

ZyapBot ReWrite
--------------------
by Beriff, Sarp and Zyapguy

Started 04/09/2021
v1.0 - 


*/

// Dependencies and requirememts
const { Client, Intents, ThreadMemberManager } = require('discord.js');
const Discord = require('discord.js');
const { MessageButton, MessageEmbed } = require('discord.js');
const paginationEmbed = require('discordjs-button-pagination');
const parser = require('./assets/parser.js')
const { LogTypes, Logger } = require('./assets/logger.js')

require('dotenv').config();
const token = process.env.TOKEN;

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const fs = require('fs');

const config = require('./config.json');

const delay = (msec) => new Promise((resolve) => setTimeout(resolve, msec));
const botLogger = new Logger('logs.txt');

/**
 * 
 * @summary gets the current time.
 * @returns {string} current time in format YYYY-MM-DD HH:MM:SS
 */
function getTime()
{
    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    // current seconds
    let seconds = date_ob.getSeconds();

    return year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;
}


/**
 * 
 * @param {*} message 
 * @param {*} array 
 * @returns if has perms 
 */
function checkPermissions(message, array)
{
    const role = roleToString(message.member);

    for (let i = 0; i < array.length; i++) {
        if (role == array[i]) {
            return true;
        }
    }
    return false;
}

/*
Usage of roleToString.
if (roleToString(message.member) == "Mod" || )
{
    console.log("This guy is a community mod");
}
else 
{
    message
}

*/

/**
 * 
 * @param {*} member 
 * @returns role to string
 */
 function roleToString(member) {
    for (var role in config.dictionary.role) {
        if (member.roles.cache.find(r => r.name === config.dictionary.role[role])) {
            console.log(role)
            return role;
        }
    }
    return "user";
}

/**
 * 
 * @param {*} num 
 * @param {*} min 
 * @param {*} max 
 * @returns clamped value
 */
function clamp(num, min, max) 
{
    return num <= min 
        ? min 
        : num >= max 
            ? max 
            : num
}

/**
 * 
 * @param {*} message 
 * @param {*} value 
 * @returns clamped
 */
function clampToRole(message, value)
{
    let role = roleToString(message.member);
    let val = config.dictionary.purge[role] || undefined;
    let clamped = clamp(value, 1, val);

    if (value > val) {
        message.reply(role + " can only purge " + val + " messages!");
    }
    return clamped;
}

const cmdParser = new parser.commandParser(config.prefix);

client.on('ready',()=>
{
    //log("ZyapBot MK2 Started.");
	client.user.setActivity("you", { type: 'WATCHING'}); // o-o
    //client.channels.cache.get(`867441128725807105`).send(".");
});

client.on("messageDelete", message => {
    if (!message.partial) {
        if (config.ids.channel.logs) {
            botLogger.log(LogTypes.INFO, "DELETED_MESSAGE", message.author.tag + ` deleted message "` + message.content + `" at "` + message.channel.name + `" channel`);
        }
    }
});

const commands = {
    ping: (message, args=[""]) => {
        const timeTaken = Date.now() - message.createdTimestamp;
        const apiLatency = Math.round(message.client.ws.ping);
        const pingEmbed = {
            "type": "rich",
            "title": `Pong! 🏓`,
            "description": "",
            "color": config.color.main,
            "fields": [
                {
                    "name": `Latency`,
                    "value": `${timeTaken}ms`,
                    "inline": true
                },
                {
                    "name": `API Latency`,
                    "value": `${apiLatency}ms`,
                    "inline": true
                }
            ],
            "footer": {
                "text": `Made by zyapguy and sarp.`
            }
        }
        message.channel.send({embeds: [pingEmbed]});
    },

    log: (message, args=[""]) => {
        let toLog = "";
        for (let i = 1; i < args.length; i++)
        {
            toLog += args[i] + " ";
        }
        botLogger.log(LogTypes.INFO, 'USER_INVOKED_COMMAND', toLog);
    },

    /* Purge(purge)
    // The purge command deletes the amount of 
    // messages you specify where you run the command.
    // Written by : sarp and zyapguy*/ 
    purge: (message, args=[""]) => {
        const member = message;
        //clampToRole(member, 100)
        const amount = args[1];
        
        if(!amount || amount == "all")
        {
            message.reply(`Please write the amount you want to purge.`);
            return;
        }
        message.channel.bulkDelete(clampToRole(message, amount))
            .then(messages => message.channel.send(`Bulk deleted ${messages.size} messages.`))
            .then(msg => {
                setTimeout(() => msg.delete(), 3000)
            })
            .catch()
        botLogger.log(LogTypes.INFO, 'PURGE', `<@${message.author.id}> has purged ${clampToRole(message, amount)} messages`);
    },
    

    /* Ban(ban)
    // If you have the permission to use the ban command, 
    // you can ban the person you want from the server. 
    // (Information goes to the banned person.)
    // Written by : sarp */ 
    ban: (message, args=[""]) => {
        const {member, mentions} = message;
        const target = mentions.users.first();
        const memberThatIsGoingToBeBannedTag = `<@${target.id}>`;
    
        if (checkPermissions(message, ["Mod","SrMod","Admin","zyapguy"]))
            {

                let reason = message.content.slice(1);
                let reasonWithoutID = reason.slice(27);

                if (!target) return message.channel.send("<@" + message.author.id + ">" + `, please specify someone to ban.`);

                const targetMember = message.guild.members.cache.get(target.id);
                
                if(!reason) reason = 'Unspecified';
                
                const embed = new MessageEmbed().setTitle("Banned!").setColor(config.color.problem).setDescription(`You have been banned from zyapguy's server for ${reasonWithoutID}.`)   

                targetMember.send({ embeds: [embed] })
                .then(() => {
                    targetMember.ban({ reason: `${reason}` })
                    .then(() => {
                        message.channel.send(`${targetMember} has been banned for "${reasonWithoutID}" successfully.`);
                        botLogger.log(LogTypes.INFO, 'BAN', `${memberThatIsGoingToBeBannedTag} has been banned by <@${message.author.id}> for ${reasonWithoutID}`);
                    })
                    .catch(() => {
                        message.channel.send(`An unexpected error has occured. Please notify ${config.ids.suppport.sarp} and ${config.ids.suppport.zyap} about this.`);
                    })
                })
            }
            else
            {
                message.channel.send("<@" + message.author.id + ">" + `, you don't have the right permissions to use this command.`);
            } 
    },
    
    /* Silent/Ghost Ban(silentban)
    // If you have the permission to use the ban command, 
    // you can ban the person you want from the server. 
    // No information goes to anyone including the banned person.
    // Written by : sarp */ 
    silentban: (message, args=[""]) => {
        const {member, mentions} = message;


        if (checkPermissions(message, ["Mod", "SrMod", "Admin", "zyapguy"])) {
            const target = mentions.users.first();
            const memberThatIsGoingToBeSilentBannedTag = `<@${target.id}>`;
            let reason = message.content.slice(1);
            let reasonWithoutID = reason.slice(33);

            const targetMember = message.guild.members.cache.get(target.id);

            if (!reason) reason = 'Unspecified';

            targetMember.ban({ reason: `${reason}` })

                .then(() => {
                    botLogger.log(LogTypes.INFO, 'SILENT_BAN', `${memberThatIsGoingToBeSilentBannedTag} has been **SILENTLY** banned by <@${message.author.id}> for ${reasonWithoutID}`);
                })
                .then(msg => {
                    setTimeout(() => message.channel.bulkDelete(1), 200)
                })
        }
        else {
            message.channel.bulkDelete(1)
            .then(() => {
                message.channel.send(`That command does not exist.`);
                setTimeout(() => message.channel.bulkDelete(1), 2000);
            })
        } 
    },

    /* Unban(unban)
    // If you have the permission to unban, 
    // you can unban the person you want.
    // Written by : sarp */
    // -----------------------------
    // !! IMPORTANT NOTE !!
    // You need to write the ID of the banned person,
    // If you @ the person who is banned, the command won't work
    // ----------------------------- 
    unban: (message, args=[""]) => {
        const {member, mentions} = message;

        if (checkPermissions(message, ["Mod", "SrMod", "Admin", "zyapguy", "CmMod"])) {
            const memberThatIsGoingToBeUnbanned = message.content.split(" ")[1];
            const memberThatIsGoingToBeUnbannedTag = `<@${memberThatIsGoingToBeUnbanned}>`;

            message.guild.members.unban(memberThatIsGoingToBeUnbanned)

                .then(() => {
                    message.channel.send(`${memberThatIsGoingToBeUnbannedTag} has been unbanned successfully.`);
                    botLogger.log(LogTypes.INFO, 'UNBAN', memberThatIsGoingToBeUnbannedTag + " has been unbanned by " + "<@" + message.author.id + ">" + " for NO_REASON_SPECIFIED");
                })

                .catch(() => {
                    message.channel.send(`An unexpected error has occured. Please notify ${config.ids.suppport.sarp} and ${config.ids.suppport.zyap} about this.`);
                })

            if (memberThatIsGoingToBeUnbanned.length < 18 || memberThatIsGoingToBeUnbanned.length > 18) {
                message.channel.send("<@" + message.author.id + ">" + `, please specify someone to ban using their id or the command won't work.`);
            }
        }
        else {
            message.channel.send("<@" + message.author.id + ">" + `, you don't have the right permissions to use this command.`);
        }
    },

    /* Kick(kick)
    // If you have the permission to kick people, 
    // you can kick the person you want from the server.
    // Written by : sarp */
    kick: (message, args=[""]) => {
        const {member, mentions} = message;
        const target = mentions.users.first();
        const memberThatIsGoingToBeKickedTag = `<@${target}>`;

        if (checkPermissions(message, ["Mod", "SrMod", "Admin", "zyapguy", "CmMod"])) {

            const targetMember = message.guild.members.cache.get(target.id);

            if (!target) return message.channel.send("<@" + message.author.id + ">" + `, please specify someone to kick.`);

            const embed = new MessageEmbed().setTitle("Kicked!").setColor(config.color.problem).setDescription(`You have been kicked from zyapguy's server.`)

            targetMember.send({ embeds: [embed] })
                .then(() => {
                    targetMember.kick()
                        .then(() => {
                            message.channel.send(`${targetMember} has been kicked successfully.`);
                            botLogger.log(LogTypes.INFO, 'KICK', memberThatIsGoingToBeKickedTag + " has been kicked by " + "<@" + message.author.id + ">");
                        })
                        .catch(() => {
                            message.channel.send(`An unexpected error has occured. Please notify ${config.ids.suppport.sarp} and ${config.ids.suppport.zyap} about this.`);
                        })
                })
        }
        else {
            message.channel.send("<@" + message.author.id + ">" + `, you don't have the right permissions to use this command.`);
        }
    },


    /* Poll(poll)
    // If you have the permission to poll, 
    // you can make a poll using this command.
    // Written by : sarp */
    poll: (message, args=[""]) => {

        let pollTitle = args[0];
        let answer1 = args[1];
        let answer2 = args[2];

        let embedPoll = new MessageEmbed()
            .setTitle('📝 Poll - ' + pollTitle)
            .setDescription("✅" + answer1 + " / " + "❌" + answer2)
            .setColor('YELLOW')
            .setFooter("Poll starter: " + message.author.tag)

        if (checkPermissions(message, ["Mod", "SrMod", "Admin", "zyapguy", "Helper", "CmMod"])) {
            message.channel.bulkDelete(1)
                .then(async () => {
                    let msgEmbed = await message.channel.send({ embeds: [embedPoll] });
                    await msgEmbed.react('✅');
                    await msgEmbed.react('❌');
                });
        }
        else {
            message.channel.send("<@" + message.author.id + ">" + `, you don't have the right permissions to use this command.`);
        }
    },

    say: (message, args=[""]) => {
        var body = commandBody.replace(command + ' ', '');

        if (checkPermissions(message, ["Mod", "SrMod", "Admin", "zyapguy", "CmMod"])) {
            message.channel.bulkDelete(1)
                .then(() => {
                    message.channel.send(body)
                        .then(() => {
                            botLogger.log(LogTypes.INFO, 'SAY', "<@" + message.author.id + ">" + " sent: '" + body + "' using the say command");
                        });
                });
        }
        else {
            message.channel.send("<@" + message.author.id + ">" + `, you don't have the right permissions to use this command.`);
        }
    },

    stg: (message, args=[""]) => {            
        var body = commandBody.replace(command + ' ', '');
        if (checkPermissions(message, ["Mod", "SrMod", "Admin", "zyapguy", "CmMod"])) {
            client.channels.cache.get('867441128725807105').send(body);
        }
    },

    help: (message, args=[""]) => {
        const embed1 = new MessageEmbed()
            .setTitle('🤖 - Bot Help')
            .setDescription('Prefix: `$`')
            .setColor(config.color.main)
            .setFields(
                {
                    "name": `Ping`,
                    "value": `You can use the ping command to see the delay between your message and the bot.\nUsage example: \`$ping\``
                },
                {
                    "name": `Purge`,
                    "value": `Community moderators and higher users can use the purge command to bulk delete messages that the command ran at.\nUsage example: \`$purge (amount)\``
                },
                {
                    "name": `Socials`,
                    "value": `*not implemented yet*\nYou can use the socials command to see the social media accounts of zyapguy.\nUsage example: \`$socials\``
                },
                {
                    "name": `Poll`,
                    "value": `You can use the poll command to make a new poll with 2 answers if you are a helper or hirgher.\nUsage example: \`$poll your question, answer 1, answer 2\``
                },
                {
                    "name": `Say`,
                    "value": `*not implemented yet*`
                }
            );

        const embed2 = new MessageEmbed()
            .setTitle('🤖 - Bot Help')
            .setDescription('Prefix: `$`')
            .setColor(config.color.main)
            .setFields(
                {
                    "name": `Kick`,
                    "value": `You can use the kick command to kick users from the server if you are a community moderator or higher.\nUsage example: \`$kick @user\``
                },
                {
                    "name": `Ban`,
                    "value": `You can use the ban command to ban users from the server if you are a moderator or higher.\nUsage example: \`$ban @user (reason)\``
                },
                {
                    "name": `Unban`,
                    "value": `You can use the unban command to unban users that were banned before if you are a moderator or higher.\nUsage example: \`$unban userid\`\n **IF YOU PING THE USER INSTEAD OF WRITING THE USER ID, THE BOT WILL CRASH!**`
                },
            )
            .setFooter('Made by Beriff, Sarp and Zyapguy');

        const button1 = new MessageButton()
            .setCustomId('previousbtn')
            .setLabel('Previous')
            .setStyle('DANGER');

        const button2 = new MessageButton()
            .setCustomId('nextbtn')
            .setLabel('Next')
            .setStyle('SUCCESS');

        const pages = [
            embed1,
            embed2,
        ];

        const buttonList = [
            button1,
            button2
        ]

        paginationEmbed(message, pages, buttonList, 12000);
    },

    /* Add Role(addrole)
    // If you have the permission to use the addrole command, 
    // you can add a role to any person on the server. 
    // Written by : sarp */ 
    addrole: (message, args=[""]) => {
        const {mentions, guild} = message;
        const target = message.mentions.members.first();
        let roleContent = message.content.slice(32);

        if (checkPermissions(message, ["Mod", "SrMod", "Admin", "zyapguy", "CmMod"])) {
            const targetMember = message.guild.members.cache.get(target.id);
            let role = message.guild.roles.cache.find(r => r.name === roleContent);
            target.roles.add(role)
                .then(() => {
                    message.channel.send(`The role has been given to ${targetMember} successfully.`);
                })
                .catch(() => {
                    message.channel.send(`Are you sure that you wrote the user or the role right?`);
                });
        }
        else {
            message.channel.send("<@" + message.author.id + ">" + `, you don't have the right permissions to use this command.`);
        }
    },
	
    /* Remove Role(removerole)
    // If you have the permission to use the removerole command, 
    // you can remove a role from any person except zyapguy. 
    // Written by : sarp */ 
	removerole: (message, args=[""]) => {
        const {mentions, guild} = message;
        const target = message.mentions.members.first();
        let roleContent = message.content.slice(35);

        if (target == '291592918592913408' || target == '356881136984522763') return message.channel.send("nope, not gonna do that.");

        if (checkPermissions(message, ["Mod", "SrMod", "Admin", "zyapguy", "CmMod"])) {
            const targetMember = message.guild.members.cache.get(target.id);
            let role = message.guild.roles.cache.find(r => r.name === roleContent);
            target.roles.remove(role)
                .then(() => {
                    message.channel.send(`The role has been removed from ${targetMember} successfully.`);
                })
                .catch(() => {
                    message.channel.send(`Are you sure that you wrote the user or the role right?`);
                });
        }
        else {
            message.channel.send("<@" + message.author.id + ">" + `, you don't have the right permissions to use this command.`);
        }
    },

    poop: (message, args=[""]) => 
    {
        message.channel.bulkDelete(1)
        .then(() => {
            message.channel.send('💩');
        });
    },

    userinfo: (message, args=[""]) => {
        if (checkPermissions(message, ["Mod", "SrMod", "Admin", "zyapguy", "CmMod"])) 
        {
            const target = message.mentions.users.first();
            let target1 = message.mentions.members.first() || await message.guild.members.fetch(args[0]);

            const embed = new Discord.MessageEmbed()
                .setColor(config.color.info)
                .setTitle(`Info for ${target.tag}`)
                .setDescription(`
                    Account Created At: ${target.createdAt.toLocaleString()}
                    Account Joined At: ${target1.joinedAt.toLocaleString()}
                    Presence:
                        Status: ${target.presence.status}
                        Activity: **${target.presence.activities[0].type}** ${target.presence.activities[0].name}
                `)
                .setImage(target.displayAvatarURL())
            message.channel.send({ embeds: [embed] })
        }
        else {
            message.channel.send("<@" + message.author.id + ">" + `, you don't have the right permissions to use this command.`);
        }
    },

    countdown: (message, args=[""]) => {
        if (checkPermissions(message, ["Mod", "SrMod", "Admin", "zyapguy", "CmMod"]))
        {
            // best if statement ever that is totally needed
            if (!Number.isInteger(parseInt(args[0]))) return message.channel.send("31?")

            let secondsleft = parseInt(args[0]) + 1

            const countdownMessage = message.channel.send("Starting countdown!")

            const countdown = setInterval(() => {
                if (secondsleft <= 1) {
                    clearInterval(countdown);
                    countdownMessage.then(m => { m.edit("Countdown done!") })
                } else {
                    countdownMessage.then(m => { m.edit(secondsleft.toString()) })
                }
                secondsleft -= 1;
            }, 1000);
        }
        else {
            message.channel.send("<@" + message.author.id + ">" + `, you don't have the right permissions to use this command.`);
        }
    },

    shutdown: (message, args=[""]) => {
        let confirmContent = message.content.slice(10);
        console.log(confirmContent);

        if (checkPermissions(message, ["Mod", "SrMod", "Admin", "zyapguy", "CmMod"])) {
            if (confirmContent == "yes") {
                message.channel.send("Shutting down...").then(() => {
                    client.destroy();
                });
            }
            else {
                message.channel.send("Write `$shutdown yes` to confirm the shutdown of the bot.");
            }
        }
        else {
            message.channel.send("<@" + message.author.id + ">" + `, you don't have the right permissions to use this command.`);
        }
    }
};

client.on("message", async message => 
{
    if (message.author.bot) return;
    if (!message.content.startsWith(config.prefix)) return;
    
    var parsed = cmdParser.parse(message.content);
    if (parsed.name in commands)
        commands[parsed.name] (message, parsed.args);
    else
        message.reply("Command doesn't exist!");
});

client.login(token);
