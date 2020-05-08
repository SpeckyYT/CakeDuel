const { Client, Collection } = require('discord.js');
const bot = new Client();

// Config
require('./handlers/config.js')();
const config = require('../config.json');
bot.config = config;

// Self-Dependencies
require('./handlers/botfunctions')(bot);
require('./handlers/prototypes');

// Dependencies
require('more-array-methods')();

// Global variables
let playing = [];
let searching = new Collection();

bot.on("message", async msg => {
    if(msg.author.bot) return;

    if(!msg.content.toLowerCase().startsWith(config.prefix) || !msg.content.slice(config.prefix.length).length) return;

    msg.content = msg.content.slice(config.prefix.length).trim();
    msg.args = msg.content.replace(/\s\s+/g, ' ').toLowerCase().split(' ');
    msg.command = msg.args[0].toLowerCase();
    msg.cmdcontent = msg.content.slice(msg.command.length).trim();
    msg.cmdargs = msg.args.slice(1);
    
    switch(msg.command){

        case 'start':
            let requester = msg.author;
            let opponent = msg.mentions.users.first();

            if(playing.includes(requester.id) || opponent ? playing.includes(opponent.id) : false) return;

            const req = async () => {
                playing.push(msg.author.id,opponent.id);

                await require('./util').request(bot,requester,opponent);

                playing = playing.filter(v => !(v.includes(msg.author.id)||v.includes(opponent.id)));
            }

            if(opponent ? !opponent.bot : false){
                await req();
            }else{
                if(searching.size > 0){
                    if(searching.has(msg.author.id)){
                        return await msg.channel.send("You are already searching for a game.")
                    }
                    opponent = searching.first();
                    searching.delete(opponent.id);
                    await req();
                }else{
                    msg.channel.send("Waiting for wothly opponent...\nYou will be notified when another player wants to play...");
                    searching.set(msg.author.id,msg.author);
                }
            }
        break;

        case 'eval':
            if(!bot.isOwner(msg.author.id)) return;

            let res;

            try{
                res = require('util').inspect(eval(msg.cmdcontent),{depth:0});
            }catch(e){
                res = e;
            }

            await msg.channel.send(`\`\`\`js\n${String(res || "undefined").slice(0,1950)}\n\`\`\``);
        break;
    }
})


bot.login(config.token)
.then(()=>{
    console.log("Logged in successfully")
    process.title = bot.user.username;
})
.catch(()=>{
    console.log("Error during login (maybe token is wrong)")
})
