const { Client } = require('discord.js');
const bot = new Client();


require('./handlers/config.js')();
const config = require('../config.json');

require('more-array-methods')();

const { request } = require('./util');

let playing = [];
let searching = [];

bot.on("message", async msg => {
    if(msg.channel.type == "dm") return;
    if(msg.author.bot) return;

    if(!msg.content.toLowerCase().startsWith(config.prefix) || !msg.content.slice(config.prefix.length).length) return;

    msg.content = msg.content.slice(config.prefix.length).trim();
    msg.args = msg.content.replace(/\s\s+/g, ' ').toLowerCase().split(' ');
    msg.command = msg.args[0].toLowerCase();
    msg.cmdargs = msg.args.slice(1);
    
    switch(msg.command){

        case "start":
            let requester = msg.author;
            let opponent = msg.mentions.users.first();

            if(playing.includes(requester.id) || opponent ? playing.includes(opponent.id) : false) return;

            const req = async () => {
                playing.push(msg.author.id,opponent.id);

                await request(bot,requester,opponent);

                playing = playing.filter(v => !(v.includes(msg.author.id)||v.includes(opponent.id)));
            }

            if(opponent ? !opponent.bot : false){
                await req();
            }else{
                if(searching.length > 0){
                    opponent = searching[0];
                    searching = searching.slice(1);
                    await req();
                }else{
                    msg.channel.send("Waiting for wothly opponent...\nYou will be notified soon...");
                    searching.push(msg.author);
                }
            }
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
