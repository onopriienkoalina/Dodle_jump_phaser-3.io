const config = {
    type: Phaser.AUTO,
    scale : {
        parent: 'gamespace',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 600,
        height: 800
    },
    physics: {
        default: 'arcade',
        arcade: {
        }
    },
    audio: {
        disableWebAudio: true
    },
    scene: [Game, ],
    backgroundColor: '#E1F3FE'
};
const game = new Phaser.Game(config);

