const { Client } = require('discord.js');
const bot = new Client();


require('./handlers/config.js')();
const config = require('../config.json');

let playing = []

bot.on("message", async msg => {
    if(msg.channel.type == "dm") return;
    if(msg.author.bot) return;

    if(!msg.content.toLowerCase().startsWith(config.prefix) || !msg.content.slice(config.prefix.length).length) return;

    msg.content = msg.content.slice(config.prefix.length).trim();
    msg.args = msg.content.replace(/\s\s+/g, ' ').toLowerCase().split(' ');
    msg.command = msg.args[0].toLowerCase();
    msg.cmdargs = msg.args.slice(1);

    console.log(msg)
    
    switch(msg.command){

        case "start":
            if(playing.includes(msg.author.id)) return;

            let opponent = msg.mentions.users.first();
            if(opponent?!opponent.bot:false){
                opponent.send(` ${msg.author} wants to play Cake Duel with you!\nReact if you want to play or not!`)
                .then(async ms => {
                    playing.push(msg.author.id);
                    playing.push(opponent.id);

                    const yes = "👌";
                    const no = "🇽"
                    await ms.react(yes);
                    await ms.react(no);

                    const filter = (r,u) => [yes,no].includes(r.emoji.name) && u.id != bot.user.id;

                    await ms.awaitReactions(filter,{time: 30000, max:1, errors: ['time']})
                    .then(async r => {
                        if(r.get(yes)){
                            opponent.send("You accepted the game!\nThe game will start soon!");
                            msg.author.send(`Game with ${opponent} got accepted!\nThe game will start soon!`);

                            await require('./game/game.js')(bot,msg.author,opponent)
                            .then(()=>{
                                [msg.author,opponent].forEach(async u => u.send("Game ended!"));
                            })
                            .catch(()=>{
                                [msg.author,opponent].forEach(async u => u.send("An error occurred"));
                            })
                        }else{
                            opponent.send("Game got denied.");
                            msg.author.send(`Game with ${opponent} got denied.`)
                        }
                    })
                    .catch(async ()=>{
                        opponent.send("Time elapsed");
                        msg.author.send(`Game with ${opponent} got denied`);
                    })

                    playing = playing.filter(v => !(v.includes(msg.author.id) || v.includes(opponent.id)));
                })

            }else{
                msg.channel.send("Opponent not found, be sure to mention one next time");
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
