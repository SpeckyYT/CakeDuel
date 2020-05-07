const { MessageEmbed } = require('discord.js');

module.exports = {
    embed: (game, player) => {
        return new MessageEmbed()
    },

    request: async (bot,requester,opponent) => {
        const msg = await opponent.send(` ${requester} wants to play Cake Duel with you!\nReact if you want to play or not!`);

        const yes = "👌";
        const no = "🇽";
        await msg.react(yes);
        await msg.react(no);

        const filter = (r,u) => [yes,no].includes(r.emoji.name) && u.id != bot.user.id;

        await msg.awaitReactions(filter,{time: 60000, max:1, errors: ['time']})
        .then(async r => {
            if(r.get(yes)){
                opponent.send("You accepted the game!\nThe game will start soon!");
                requester.send(`Game with ${opponent} got accepted!\nThe game will start soon!`);

                await require('./game.js')(bot,requester,opponent)
                .then(()=>{
                    [requester,opponent].forEach(async u => u.send("Game ended!"));
                })
                .catch(e=>{
                    console.error(e);
                    [requester,opponent].forEach(async u => u.send("An error occurred"));
                })
            }else{
                opponent.send("Game got denied.");
                requester.send(`Game with ${opponent} got denied.`)
            }
        })
        .catch(async ()=>{
            opponent.send("Time elapsed");
            requester.send(`Game with ${opponent} got denied`);
        })
    }
}