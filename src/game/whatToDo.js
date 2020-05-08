module.exports = async (player,options) => {
    player.send("What do you want to do?\n"+
        options.join(', ').split(' ').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ')) // Capitalizes every word
    .then(async msg => {
        if(options.sincludes('claim')) await msg.react("🇨");
    })
}