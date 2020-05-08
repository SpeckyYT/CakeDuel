const deck = [
    "sol","sol","sol","sol","sol", // 5 soldiers
    "arc","arc","arc","arc", // 4 archers
    "def","def","def","def", // 4 defenders
    "wiz","wiz","wiz", // 3 wizards
    "sci","sci","sci", // 3 scientists
    "wol" // wolfy
];

const special = [ // UNUSED ATM
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
]

module.exports = async (bot, player1, player2) => {
    let game = {
        bout: 0,
        turn: 0,

        deck: deck,
        special: special,
        dp: [], // discard pile of cards

        p1: {
            hand: [],
            cakes: 0,
            trophies: 0
        },

        p2: {
            hand: [],
            cakes: 0,
            trophies: 0
        },

        continue: true,
        pass: 0,
        challenge: false,

        otherPlayer(player){
            if(player === 1) return 2;
            if(player === 2) return 1;
        },

        playerExists(player){
            if(!this["p"+player]) throw "Error at function 'resupply', number is invalid";
        },

        async startTurn(player){
            this.turn++;
            await player1.send(`This is your hand: ${this.p1.hand.join(', ')}`);
            await player2.send(`This is your hand: ${this.p2.hand.join(', ')}`);

            // ATKR: Attack Claim / Pass
            await require('./game/whatToDo')(player1,["claim attack","pass"]);

            // DEFR: Challenge Attack / Accept / Block Claim
            await require('./game/whatToDo')(player2,["challenge attack","accept","claim block"]);

            // ATKR: Challenge Block / Accept
            await require('./game/whatToDo')(player1,["challenge block","accept"]);

            // Resolve

            // Check Conditions
            if(
                (!this.p1.cakes || !this.p2.cakes) || // When one of the players has no cakes 
                (this.pass > 1) ||  // When both player pass
                (this.challenge) || // When a player challenges
                (this.turn > 20) // When a bout is too long [DEBUG, CAN BE REMOVED ONCE EVERYTHING IS GOOD]
            ){
                this.continue = false;
            }

            // Resupply
            game.resupply(player);
            game.resupply(this.otherPlayer(player));

            if(this.continue){
                await this.startTurn(this.otherPlayer(player));
            }else{
                if(this.p1.cakes > this.p2.cakes){
                    await player1.send("You won the bout :tada:");
                    await player2.send("You lost the bout...");
                }else{
                    await player2.send("You won the bout :tada:");
                    await player1.send("You lost the bout...");
                }
            }
        },

        async startBout(player){
            if(!player) player = Math.round(Math.random())+1;
            this.bout++;
            this.deck = deck.shuffle();
            this.dp = [];
            this.p1.hand = [];
            this.p2.hand = [];
            game.resupply(1);
            game.resupply(2);
            this.p1.cakes = (player === 1 ? 3 : 4);
            this.p2.cakes = (player === 2 ? 3 : 4);
            this.continue = true;
            await this.startTurn(player);
        },

        resupply(player){
            this.playerExists(player);
            let { hand } = this["p"+player];
            let { deck } = this;
            while(hand.length < 4 && deck.length > 0){
                hand.push(deck[0]);
                deck = deck.slice(1);
            }
        },

        discardCards(player,cards){
            this.playerExists(player);
            let { hand } = this["p"+player];
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
        }
    }

    let play = true;

    while(game.bout < 5){
        await game.startBout();
    }
    // this code below is only for testing
    game.discardCards(1,['wol','sol','sol','arc']);
    game.discardCards(2,'wiz');
    game.resupply(1);
    game.resupply(2);
    console.log(game);


    play = false;
}
