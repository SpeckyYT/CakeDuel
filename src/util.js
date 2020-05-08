module.exports = {
    request: async (bot,requester,opponent) => {
        const announce = text => {
            [requester,opponent].forEach(async u => await u.send(text).catch(()=>{}));
        }

        const msg = await opponent.send(` ${requester} wants to play Cake Duel with you!\nReact if you want to play or not!`);

        const yes = "👌";
        const no = "🇽";
        await msg.react(yes);
        await msg.react(no);

        const filter = (r,u) => [yes,no].includes(r.emoji.name) && u.id != bot.user.id;

        let runned = false;

        await msg.awaitReactions(filter,{time: 60000, max:1, errors: ['time']})
        .then(async r => {
            runned = true;
            if(r.get(yes)){
                opponent.send("You accepted the game!\nThe game will start soon!");
                requester.send(`Game with ${opponent} got accepted!\nThe game will start soon!`);

                await require('./game')(bot,requester,opponent)
                .then(() => {
                    announce("Game ended!");
                })
                .catch(e=>{
                    console.error(e);
                    announce("An error occurred");
                })
            }else{
                opponent.send("Game got denied.");
                requester.send(`Game with ${opponent} got denied.`)
            }
        })
        .catch(async e => {
            if(runned){
                announce("An error occurred"); 
                console.error(e);    
            }else{
                opponent.send("Time elapsed");
                requester.send(`Game with ${opponent} got denied`);
            }
        })
    }
}