const fs = require('fs');

module.exports = () => {
    const template = {
        token: "BOT TOKEN HERE",
        prefix: "BOT PREFIX HERE",
        owners: ["BOT OWNER 1 ID","BOT OWNER 2 ID"]
    }

    if(!fs.existsSync('../config.json')){
        fs.appendFileSync('../config.json', JSON.stringify(template,null,4));
    }
}
