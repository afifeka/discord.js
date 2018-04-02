const botconfig = require("./botconfig.json");
const Discord = require("discord.js");
const cpu = process.cpuUsage().system / 1024 / 1024;
const used = process.memoryUsage().heapUsed / 1024 / 1024;
const ms = require("ms");
const YTDL = require("ytdl-core");

const bot = new Discord.Client({disableEveryone: true});

function play(connection, message) {
  var server = servers[message.guild.id];

  server.dispatcher = connection.playStream(YTDL(server.queue[0], {filter: "audioonly"}));

  server.queue.shift();

  server.dispatcher.on("end", function() {
    if (server.queue[0]) play(connection, message);
    else connection.disconnect();
  })
}

var servers = {};

bot.on("ready", async () => {
  console.log(`${bot.user.username} is online!`);

  function randomStatus() {
        let status = [`${bot.guilds.size} Guilds In Your Party!`, `On ${bot.users.size.toLocaleString()} Users!`, 'Update Clear To Purge!', `Help? | !help`]
        let rstatus = Math.floor(Math.random() * status.length);
        bot.user.setActivity(status[rstatus], {type: 'STREAMING'});

   }; setInterval(randomStatus, 40000)
 
  
});

bot.on('guildMemberAdd', member => {
 
  const channel = member.guild.channels.find('name', 'join-left');
  
  if (!channel) return;
  
  channel.send(`${member} Joined The Server!  `);
});

bot.on('guildMemberRemove', member => {
 
  const channel = member.guild.channels.find('name', 'join-left');
  
  if (!channel) return;
  
  channel.send(`${member} Left The Server! `);
});


bot.on("message", async message => {
  if(message.author.bot) return;
  if(message.channel.type === "dm") return;
  
  
  let prefix = botconfig.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = messageArray.slice(1);

  if(cmd === `${prefix}kick`){

    //!kick @daeshan askin for it

    let kUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!kUser) return message.channel.send(":warning: **| Please Tag Player To Be Kicked!**");
    let kReason = args.join(" ").slice(22);
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.channel.send("No can do pal!");
    if(kUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send(":negative_squared_cross_mark: **| Failed To Kicked This Person!**");

    let kickEmbed = new Discord.RichEmbed()
    .setDescription("**KICKED**")
    .setColor("#f80a0a")
    .addField(":bust_in_silhouette: | Player Kicked", `**${kUser} | ID ${kUser.id}**`)
    .addField(":bust_in_silhouette: | Kicked By", `**<@${message.author.id}> | ID ${message.author.id}**`)
    .addField(":no_entry: | Reason", kReason);

    let kickChannel = message.guild.channels.find(`name`, "mod-log");
    if(!kickChannel) return message.channel.send("No Named Channel `mod-log`.");

    message.guild.member(kUser).kick(kReason);
    
    message.delete().catch(O_o=>{});
    message.channel.send(":white_check_mark:  | **Succes Kicked Players**")
    kickChannel.send(kickEmbed);

    return;
  }
  

  if(cmd === `${prefix}ban`){

    let bUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!bUser) return message.channel.send(":warning: **| Please Tag Player To Be Banned!**");
    let bReason = args.join(" ").slice(22);
    if(!message.member.hasPermission("MANAGE_MEMBERS")) return message.channel.send("No can do pal!");
    if(bUser.hasPermission("MANAGE_MESSAGES")) return message.channel.send(":negative_squared_cross_mark: **| Failed To Banned This Person!**");

    let banEmbed = new Discord.RichEmbed()
    .setDescription("**BANNED**")
    .setColor("#f80a0a")
    .addField(":bust_in_silhouette: | Player Banned", `**${bUser} | ID ${bUser.id}**`)
    .addField(":bust_in_silhouette: | Banned By", `**<@${message.author.id}> | ID ${message.author.id}**`)
    .addField(":no_entry: | Reason", bReason);


    let modlogchannel = message.guild.channels.find(`name`, "mod-log");
    if(!modlogchannel) return message.channel.send("No Named Channel `mod-log`.");

    message.guild.member(bUser).ban(bReason);
    
    message.delete().catch(O_o=>{});
    message.channel.send(":white_check_mark:  | **Succes Banned Players**")
    modlogchannel.send(banEmbed);


    return;
  }
  
  
  if (cmd === `${prefix}stats`){

    let testembed = new Discord.RichEmbed()
    .setDescription("**STATS**")
    .setColor("#00fa3d")
    .addField(":mag: | Total Server", `${bot.guilds.size} Servers!`)
    .addField(":satellite: | Total Channels", `${bot.channels.size} Channels!`)
    .addField(":busts_in_silhouette: | Total Users", `${bot.users.size.toLocaleString()} Users!`)
    .addField(":notebook_with_decorative_cover: | Library", "Discord.js")
    .addField(":bulb: | CPU Usage", `${Math.round(cpu * 100) / 100}%`, true)
    .addField(":clipboard: | Memory Usage", `${Math.round(used * 100) / 100} MB`)
    .setFooter("This Command Has Released")

    message.channel.send(testembed);
  }
  

  if(cmd === `${prefix}addrole`){
    if (!message.member.hasPermission("MANAGE_ROLES")) return errors.noPerms(message, "MANAGE_ROLES");
    if (args[0] == "help") {
      message.reply("Usage: !addrole <user> <role>");
      return;
    }
    let rMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if (!rMember) return errors.cantfindUser(message.channel);
    let role = args.join(" ").slice(22);
    if (!role) return message.reply("Specify a role!");
    let gRole = message.guild.roles.find(`name`, role);
    if (!gRole) return message.reply("Couldn't find that role.");
  
    if (rMember.roles.has(gRole.id)) return message.reply("They already have that role.");
    await (rMember.addRole(gRole.id));
  
    try {
      await rMember.send(`Congrats, you have been given the role ${gRole.name}`)
    } catch (e) {
      console.log(e.stack);
      message.channel.send(`Congrats to <@${rMember.id}>, they have been given the role ${gRole.name}. We tried to DM them, but their DMs are locked.`)
    }
  }
  
  if(cmd === `${prefix}removerole`){
    if (!message.member.hasPermission("MANAGE_ROLES")) return errors.noPerms(message, "MANAGE_ROLES");
    if(args[0] == "help"){
      message.reply("Usage: !removerole <user> <role>");
      return;
    }
    let rMember = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0]);
    if(!rMember) return message.reply("Couldn't find that user, yo.");
    let role = args.join(" ").slice(22);
    if(!role) return message.reply("Specify a role!");
    let gRole = message.guild.roles.find(`name`, role);
    if(!gRole) return message.reply("Couldn't find that role.");
  
    if(!rMember.roles.has(gRole.id)) return message.reply("They don't have that role.");
    await(rMember.removeRole(gRole.id));
  
    try{
      await rMember.send(`RIP, you lost the ${gRole.name} role.`)
    }catch(e){
      message.channel.send(`RIP to <@${rMember.id}>, We removed ${gRole.name} from them. We tried to DM them, but their DMs are locked.`)
    }
  }
  
  if(cmd === `${prefix}ikan`){
    if(!args[2]) return message.reply("**Usage `!ikan apakah <Question>`**");
    let replies = ["Iya", "Tidak", "Saya Tidak Tahu", "Apa Yang Kamu Bilang?", "Sangat Benar", "Sangat Salah"];

    let result = Math.floor((Math.random() * replies.length));
    let question = args.slice(1).join(" ");

    let ballembed = new Discord.RichEmbed()
    .setColor("#8d09f1")
    .addField(":question: | Question", question)
    .addField(":envelope_with_arrow: | Answer", replies[result])
    .setFooter(`Question By ${message.author.tag}`);

    message.channel.send(ballembed)

  }
  
  if(cmd === `${prefix}userinfo`){
    const member = message.mentions.members.first() || message.guild.members.get(args[0]) || message.member;
    let embed = new Discord.RichEmbed()
    .setDescription("**USER INFO**")
    .setColor("#00a6ff")
    .setImage(member.user.displayAvatarURL)
    .addField(":bust_in_silhouette: | Player", `${member.user.tag}`)
    .addField(":shield: | ID", member.id)
    .addField(":hammer: | Created", member.user.createdAt)
    .addField(":inbox_tray: | Joined", member.joinedAt);

    message.channel.send(embed);
    return;
  }


  if(cmd === `${prefix}report`){

    //!report @ned this is the reason

    let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!rUser) return message.channel.send(":warning: **| Please Tag Player To Be Report!**");
    let rreason = args.join(" ").slice(22);

    let reportEmbed = new Discord.RichEmbed()
    .setDescription("**REPORTS**")
    .setColor("#f3d804")
    .addField(":bust_in_silhouette: **| Player**", `**${rUser} | ID: ${rUser.id}**`)
    .addField(":mag: **| Reason**", rreason)
    .setFooter("Beta v0.2 | Discord.js");

    let reportschannel = message.guild.channels.find(`name`, "mod-log");
    if(!reportschannel) return message.channel.send("No Named Channel `mod-log`.");


    message.delete().catch(O_o=>{});
    message.channel.send(":white_check_mark: **| Success Reported The Player!**")
    reportschannel.send(reportEmbed);

    return;
  }
  
  if(cmd === `${prefix}prefix`) {
    if(!message.member.hasPermission("MANAGE_SERVER")) return message.reply("No no no.");
    if(!args[0] || args[0 == "help"]) return message.reply("Usage: !prefix <desired prefix here>");
  
    let prefixes = JSON.parse(fs.readFileSync("./prefixes.json", "utf8"));
  
    prefixes[message.guild.id] = {
      prefixes: args[0]
    };
  
    fs.writeFile("./prefixes.json", JSON.stringify(prefixes), (err) => {
      if (err) console.log(err)
    });
  
    let sEmbed = new Discord.RichEmbed()
    .setColor("#FF9900")
    .setTitle("Prefix Set!")
    .setDescription(`Set to ${args[0]}`);
  
    message.channel.send(sEmbed);
  
  }




  if(cmd === `${prefix}serverinfo`){

    let sicon = message.guild.iconURL;
    let serverembed = new Discord.RichEmbed()
    .setDescription("Server Information")
    .setColor("#15f153")
    .setThumbnail(sicon)
    .addField("Server Name", message.guild.name)
    .addField("Created On", message.guild.createdAt)
    .addField("You Joined", message.member.joinedAt)
    .addField("Total Members", message.guild.memberCount)
    .setFooter("Beta v0.2 | Discord.js");

    return message.channel.send(serverembed);
  }
  
 
  if(cmd === `${prefix}info`){

    let bicon = bot.user.displayAvatarURL;
    let botembed = new Discord.RichEmbed()
    .setDescription("**BOT INFORMATION**")
    .setColor("#37FF00")
    .setThumbnail(bicon)
    .addField(":tools: | Bot Name", `**${bot.user.username}**`)
    .addField(":alarm_clock: | Created On", `**${bot.user.createdAt}**`)
    .addField(":ledger: | Discord Server", "**➭ [https://discord.gg/w829yw8]**")
    .addField(":earth_asia: | Location", "**Indonesian**")
    .addField(":bust_in_silhouette: | Developed By", "**『AfifGaming』#9369**")
    .setFooter("Beta v0.2 | Discord.js");

    return message.channel.send(botembed);
  }
  
  
  if(cmd === `${prefix}purge`){
    message.delete()
    if(!message.member.hasPermission("MANAGE_MESSAGES")) return message.reply("Sorry, You Don't Have A Permissions To Do This!");
    if(!args[0]) return message.channel.send("Please Give The Number");
    message.channel.bulkDelete(args[0]).then(() => {
      message.channel.send(`🗑 | Succed Cleared ${args[0]} messages.`).then(msg => msg.delete(2000))

      let bicon = bot.user.displayAvatarURL;
      let purgemod = new Discord.RichEmbed()
      .setDescription("**PURGE**")
      .setColor("#0283f8")
      .addField("Executor:", `${message.author}`, true)
      .addField("Purge:", `${args[0]}`, true)
      .setFooter("This Command Error?, Fast DM 『AfifGaming』#9369 To Fix This Error!");

      let modlog = message.guild.channels.find(`name`, "mod-log");
      if(!modlog) return message.channel.send("Can't Find mod-log channel.");

      modlog.send(purgemod);


    })
  }


  if(cmd === `${prefix}say`){
    if(!message.member.hasPermission("ADMINISTRATOR")) return;
    const sayMessage = args.join(" ");
    message.delete().catch();
    message.channel.send(sayMessage);
  }


  if(cmd === `${prefix}afk`){
    let afkuser = args.join(" ").slice(0);

    message.delete()
    message.guild.members.get(message.author.id).setNickname("AFK |" + message.author.username);
    message.channel.send("**:bust_in_silhouette: | User Has Afk >>** " + `${message.author} ` + `**>> ${afkuser}**`)

     return;
  }


  if(cmd === `${prefix}help`){
    let helpembed = new Discord.RichEmbed()
    .setColor("#15f153")
    .setDescription("**Prefix : `!`**")
    .addField(":lock: Moderators Command!", "| `!ban` | `!kick` | `!tempmute` | `!say` | `!purge` | `!news` | `!warn` | `!addrole help` | `!removerole help` |")
    .addField(":earth_asia: General Command", "| `!info` | `!serverinfo` | `!ping` | `!afk` | `!help` | `!kecoa apakah (question)` | `!userinfo` | `!stats` |`")
    .addField(":musical_note: Music Command", "| `Command Not Found!` |")
    .setFooter("Beta v0.2 | Discord.js");
    message.delete().catch(O_o=>{});
    message.channel.send(":mailbox_with_mail: **Sending Help To Your DM!**")
    return message.author.send(helpembed);           
  }

  if(cmd === `${prefix}ping`){
    let pingembed = new Discord.RichEmbed()
    .setDescription("**Information!**")
    .setColor("#ffc700")
    .addField("**Your Ping!**", + message.client.ping)
    return message.channel.send(pingembed);
  }

  if (cmd === `${prefix}warn`){
    if(!message.member.hasPermission("MANAGE_MEMBERS")) return message.reply("No can do pal!");
    let wUser = message.guild.member(message.mentions.users.first()) || message.guild.members.get(args[0])
    if(!wUser) return message.reply("Couldn't find them yo");
    if(wUser.hasPermission("MANAGE_MESSAGES")) return message.reply("They waaaay too kewl");
    let reason = args.join(" ").slice(22);
  
    if(!warns[wUser.id]) warns[wUser.id] = {
      warns: 0
    };
  
    warns[wUser.id].warns++;
  
    fs.writeFile("./warnings.json", JSON.stringify(warns), (err) => {
      if (err) console.log(err)
    });
  
    let warnEmbed = new Discord.RichEmbed()
    .setDescription("Warns")
    .setAuthor(message.author.username)
    .setColor("#fc6400")
    .addField("Warned User", `<@${wUser.id}>`)
    .addField("Warned In", message.channel)
    .addField("Number of Warnings", warns[wUser.id].warns)
    .addField("Reason", reason);
  
    let warnchannel = message.guild.channels.find(`name`, "incidents");
    if(!warnchannel) return message.reply("Couldn't find channel");
  
    warnchannel.send(warnEmbed);
  
    if(warns[wUser.id].warns == 2){
      let muterole = message.guild.roles.find(`name`, "muted");
      if(!muterole) return message.reply("You should create that role dude.");
  
      let mutetime = "10s";
      await(wUser.addRole(muterole.id));
      message.channel.send(`<@${wUser.id}> has been temporarily muted`);
  
      setTimeout(function(){
        wUser.removeRole(muterole.id)
        message.reply(`<@${wUser.id}> has been unmuted.`)
      }, ms(mutetime))
    }
    if(warns[wUser.id].warns == 3){
      message.guild.member(wUser).ban(reason);
      message.reply(`<@${wUser.id}> has been banned.`)
    }
  
  }
  
  if(cmd === `${prefix}news`){
    message.delete()
    let announchemebed = new Discord.RichEmbed()
    .setColor("000000")
    .addField("📢 Announcement | Information", args.join(" "))
    .setTimestamp()
    .setFooter(`Executor : ${message.author.username}#${message.author.discriminator}`)

    return message.channel.send(announchemebed);
  }
  
  
  if(cmd === `${prefix}tempmute`){
    let tomute = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
    if(!tomute) return message.reply("No Player Wants You Mute!");
    if(tomute.hasPermission("MANAGE_MESSAGES")) return message.reply("Can't mute them!");
    let muterole = message.guild.roles.find(`name`, "muted");
    //start of create role
    if(!muterole){
      try{
        muterole = await message.guild.createRole({
          name: "muted",
          color: "#000000",
          permissions:[]
        })
        message.guild.channels.forEach(async (channel, id) => {
          await channel.overwritePermissions(muterole, {
            SEND_MESSAGES: false,
            ADD_REACTIONS: false
          });
        });
      }catch(e){
        console.log(e.stack);
      }
    }
    //end of create role
    let mutetime = args[1];
    if(!mutetime) return message.reply("You didn't specify a time!");
  
    await(tomute.addRole(muterole.id));
    message.reply(`<@${tomute.id}> has been muted for ${ms(ms(mutetime))}`);
  
    setTimeout(function(){
      tomute.removeRole(muterole.id);
      message.channel.send(`<@${tomute.id}> has been unmuted!`);
    }, ms(mutetime));
  }
  
   if (cmd === `${prefix}play`){
    if (!args[1]) {
      message.channel.send("Give Me Link")
      return;
    }

    if (!message.member.voiceChannel) {
      message.channel.send("Plase Join A Voice Channel!")
      return;
    }

    if (!servers[message.guild.id]) servers[message.guild.id] = {
      queue: []
    };

    var server = servers[message.guild.id];

    server.queue.push(args[1]);

    if (!message.guild.voiceConnection) message.member.voiceChannel.join().then(function(connection) {
      play(connection, message);
    });
  }

  if (cmd === `${prefix}skip`) {
    var server = servers[message.guild.id];

    if (server.dispatcher) server.dispatcher.end();
  }

 if(cmd === `${prefix}stop`){
    var server = servers[message.guild.id];

    if (message.guild.voiceConnection) message.guild.voiceConnection.disconnect();
  }

});
  
  

bot.login(process.env.BOT_TOKEN);
