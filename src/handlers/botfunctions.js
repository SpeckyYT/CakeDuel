module.exports = bot => {
    bot.isOwner = (id) => bot.config.owners.includes(id);
}
