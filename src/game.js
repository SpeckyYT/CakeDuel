module.exports = async (bot, player1, player2) => {
    let play = true;
    let game = {
        deck: [
            "sol","sol","sol","sol","sol", // 5 soldiers
            "arc","arc","arc","arc", // 4 archers
            "def","def","def","def", // 4 defenders
            "wiz","wiz","wiz", // 3 wizards
            "sci","sci","sci", // 3 scientists
            "wol" // wolfy
        ].shuffle(), // shuffles the deck

        gy: [], // graveyard of cards [useless]

        p1h: [], // hand of player 1
        p2h: [], // hand of player 2

        p1c: 3, // cakes of player 1
        p2c: 4, // cakes of player 2

        p1w: 0, // won bouts of player 1
        p1w: 0  // won bouts of player 2
    }

    function drawHandFull(n){
        if(!game[`p${n}h`]) throw "Error at function 'drawHandFull', number is invalid";

        while(game[`p${n}h`].length < 4 && game.deck.length > 0){
            game[`p${n}h`].push(game.deck[0]);
            game.deck = game.deck.slice(1);
        }
    }

    while(play){
        drawHandFull(1);
        drawHandFull(2);
        console.log(game);
        play = false;
    }
}
