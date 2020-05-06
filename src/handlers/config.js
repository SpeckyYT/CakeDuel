const fs = require('fs');

module.exports = () => {
    const template = {
        token: "BOT TOKEN HERE",
        prefix: "BOT PREFIX HERE"
    }

    if(!fs.existsSync('../config.json')){
        fs.appendFileSync('../config.json', JSON.stringify(template,null,4));
    }
}
