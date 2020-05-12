const { MessageEmbed } = require("discord.js");

let stddeck = [
    "sol","sol","sol","sol","sol", // 5 soldiers
    "arc","arc","arc","arc", // 4 archers
    "def","def","def","def", // 4 defenders
    "wiz","wiz","wiz", // 3 wizards
    "sci","sci","sci", // 3 scientists
    "wol" // wolfy
];

let spcdeck = [ // UNUSED ATM
    "ass", // Assasin
    "sco", // Scout
    "sum", // Summoner
    "qua", // Quartermaster
    "ora", // Oracle
    "pri", // Priest
    "ang", // Angel
    "pro", // Professor Baacrates
    "age", // Agent:U
    "pie"  // Pierrot Sheepington
];

module.exports = async (bot, player1, player2) => {
    let game = {
        bout: 0,
        turn: 0,

        deck: [],
        special: [],
        dp: [], // discard pile of cards

        p1: {
            hand: [],
            cakes: 0,
            trophies: 0,
            user: player1
        },

        p2: {
            hand: [],
            cakes: 0,
            trophies: 0,
            user: player2
        },

        continue: true,
        lastplayer: Math.round(Math.random())+1,
        lastaction: [],
        pass: 0,
        challenge: false,

        otherPlayer(player){
            if(player === 1) return 2;
            if(player === 2) return 1;
        },

        playerExists(player){
            if(!this['p'+player]) throw "Error, player number is invalid";
        },

        returnPlayer(player){
            this.playerExists(player);
            return this['p'+player].user;
        },

        announce(text){
            [player1,player2].forEach(u => u.send(text).catch(()=>{}));
        },

        async whatToDo(player,options){
            return await player.send("What do you want to do?\n"+
            options.join(', ').split(' ').map(w => w.charAt(0).toUpperCase()+w.slice(1)).join(' ')) // Capitalizes every word
            .then(async msg => {
                const emo = ["🇦","🇧","👌","⏩"];
                if(options.sincludes('attack')) msg.react(emo[0]);
                if(options.sincludes('block')) msg.react(emo[1]);
                if(options.sincludes('accept')) msg.react(emo[2]);
                if(options.sincludes('pass')) msg.react(emo[3]);

                const filter = (r,u) => emo.includes(r.emoji.name) && u.id === player.id;
                let runned = false;

                return await msg.awaitReactions(filter,{time: 30000, max:1, errors: ['time']})
                .then(e => {
                    runned = true;
                    return e.first ? e.first().emoji.name : e.emoji.name;
                })
                .catch(async e => {
                    if(runned){
                        console.error(e);
                        this.announce("Unexpected error happened");
                    }

                })
            })
        },

        convertAction(emoji,timeout){
            emoji = emoji || '';
            console.table({emoji,timeout});

            let check = emoji.match(/^[^a-z0-9]+$/i);
            if(check ? check.length > 0 : false){
                if(emoji.includes('🇦')) return 'attack';
                if(emoji.includes('🇧')) return 'block';
                if(emoji.includes('👌')) return 'accept';
                if(emoji.includes('⏩')) return 'pass';
            }
            return timeout;
        },

        async playerEmbed(player){
            player = player || 0;

            const { deck, bout, lastaction } = this;

            [1,2].forEach(async p => {
                const { cakes, hand, trophies } = this['p'+p];
                const op = this['p'+this.otherPlayer(p)];
                const user = this.returnPlayer(p);
                const otheruser = this.returnPlayer(this.otherPlayer(p));

                const embed = new MessageEmbed()
                .setColor(player === 1 ? 'RED' : 'BLUE')
                .setThumbnail(bot.user.avatarURL())
                .setAuthor('Cake Duel', bot.user.avatarURL())
                .addField("Current active player", player === p ? user.tag : otheruser.tag,true)
                .addField('Last Action', lastaction[0] ? `${lastaction[0]}: ${lastaction[1]}` : 'None', true)
                .addField('Bout', bout, true)
                .addField('Cards in the Deck', deck.length, true)
                .addField('Your Hand', hand.join(', '), true)
                .addField('Your Cakes', '#'.repeat(cakes)+'0'.repeat(7-cakes), true)
                .addField('Trophies', '&'.repeat(trophies)+'-'.repeat(5 - (trophies + op.trophies))+'%'.repeat(op.trophies), true);

                user.send(embed);
            })
        },

        resupply(player){
            this.playerExists(player);
            let { hand } = this['p'+player];
            while(hand.length < 4 && this.deck.length > 0){
                hand.push(this.deck[0]);
                this.deck = this.deck.slice(1);
            }
        },

        discardCards(player,cards){
            this.playerExists(player);
            let { hand } = this['p'+player];
            let { dp } = this;
            if(Array.isArray(cards)){
                for(card in cards){
                    if(hand.indexOf(card)>=0){
                        dp.push(hand[hand.indexOf(card)]);
                        hand = hand.splice(hand.indexOf(card),1);
                    }
                }
            }else{
                if(hand.indexOf(cards)>=0){
                    hand = hand.splice(hand.indexOf(cards),1);
                    dp.push(cards);
                }
            }
        },

        updateLastAction(player,action){
            this.lastaction = player ? [this.returnPlayer(player).tag,action] : [];
        },

        async startTurn(player){
            this.turn++;
            
            this.lastplayer = this.otherPlayer(player);

            let action;

            // ATKR: Attack Claim / Pass
            this.playerEmbed(player);

            action = await this.whatToDo(this.returnPlayer(player),["claim attack","pass"]);
            action = this.convertAction(action,'pass');
            this.updateLastAction(player,action);

            if(action == 'pass'){ 
                this.pass++;
            }else{
                this.pass = 0;

                // DEFR: Challenge Attack / Accept / Block Claim
                this.playerEmbed(this.otherPlayer(player));

                await this.whatToDo(this.returnPlayer(this.otherPlayer(player)),["challenge attack","accept","claim block"]);
                action = this.convertAction(action,'accept');
                this.updateLastAction(this.otherPlayer(player),action);

                if(action != 'accept'){
                    // ATKR: Challenge Block / Accept
                    this.playerEmbed(player);

                    await this.whatToDo(this.returnPlayer(player),["challenge block","accept"]);
                    action = this.convertAction(action,'accept');
                    this.updateLastAction(player,action);
                }

                // Resolve
            }

            // Check Conditions
            if(
                (this.p1.cakes <= 0 || this.p2.cakes <= 0) // When one of the players has no cakes 
                ||
                (this.pass > 1)  // When both player pass
                ||
                (this.challenge) // When a player challenges
            ){
                this.continue = false;
            }

            this.resupply(player);
            this.resupply(this.otherPlayer(player));

            if(!this.continue){
                if(this.p1.cakes > this.p2.cakes){
                    await player1.send("You won the bout :tada:");
                    await player2.send("You lost the bout...");
                    this.lastplayer = 1;
                    this.p1.trophies++;
                }else{
                    await player2.send("You won the bout :tada:");
                    await player1.send("You lost the bout...");
                    this.lastplayer = 2;
                    this.p2.trophies++;
                }
            }
        },

        async startBout(player){
            this.lastplayer = player;
            this.bout++;
            this.turn = 0;
            this.pass = 0;
            this.deck = [...stddeck.shuffle()];
            this.special = [...spcdeck.shuffle()];
            this.dp = [];
            this.p1.hand = [];
            this.p2.hand = [];
            this.p1.cakes = (player === 1 ? 3 : 4);
            this.p2.cakes = (player === 2 ? 3 : 4);
            this.continue = true;
            this.resupply(1);
            this.resupply(2);
            while(this.continue){
                await this.startTurn(this.lastplayer); // Alternates each turn
            }
        },

        async startGame(){
            while(this.p1.trophies < 3 && this.p2.trophies < 3){
                this.updateLastAction();
                await this.startBout(this.otherPlayer(this.lastplayer)); // Alternates player
            }
            this.playerEmbed();
        }
    }

    await game.startGame();
}
