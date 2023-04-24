
let player;
let hit;
let floor;
let tile;
let tilesGroup;
let tileChild;
let breakTilesGroup;
let breakTileChild;
let DisTilesGroup
let DisTileChild;
let springGroup;
let springChild;
let starGroup;
let starChild;
let enemyNgroup;
let enemyNchild;
let enemySgroup;
let enemySchild;
let particles;
let score = 0;
let maxScore = 0;
let scoreText;
let GameOverText;
let retryText;
let tn;
let td;
let tb;
let zoneL;
let zoneR;
let rocket;
let spring;
let star;
let enemy_n;
let enemy_s;
let scoredTiles = [];

class Game extends Phaser.Scene {
	constructor() {
		super("Game");
		this.maxScoreText = null;
	}

	preload() {
		this.load.svg("player", "assets/StudioFibonacci_Cartoon_bunny.svg", { scale: .2 });
		this.load.svg("tile-n", "assets/Vector.svg", { scale: 1 });
		this.load.svg("tile-d", "assets/tile-d.svg", { scale: 1 });
		this.load.svg("tile-b", "assets/tile-b-01.svg", { scale: 1 });
		this.load.svg("spring", "assets/spring.svg", {scale: 1.8});
		this.load.svg("star", "assets/star-01.svg", {scale: 2.1});
		this.load.svg("enemy-n", "assets/enemy-n-01.svg", {scale: 2.7});
		this.load.svg("enemy-s", "assets/enemy-s-01.svg", {scale: 2.7});
		this.load.audio("jump", "assets/jump.mp3");
		this.load.audio("fall", "assets/fall1.mp3");

	}

	create() {
		floor = this.physics.add.image(game.config.width/2, 900,'tile-d');
		floor.setImmovable();
		floor.scale = 6;
		this.createTiles();
		this.createBreakTiles();
		this.createDisTiles();
		this.createPlayer();
		this.createSpring();
		this.createStars();
		this.createEnemyN();
		this.createEnemyS();

		this.jumpSound = this.sound.add("jump");
		this.fallSound = this.sound.add("fall");
		
		this.input.keyboard.on('keydown-UP', function () {
			this.jumpSound.play();
		  }, this);
		
		const source = {
			contains: function (x, y)
			{
				const hit = player.body.hitTest(x, y);
				return hit;
			}
		};
		particles = this.add.particles('bullet');
		this.emitter = particles.createEmitter({
			lifespan: Infinity,
			speed: 50,
			on: false,
			deathZone: { type: 'onEnter', source: source, }
		});

		particles.enableBody = true;
		
		scoreText = this.add.text(16, 16, 'Score: 0', { fontFamily: '"Bruno Ace SC"', fontSize: '30px', fill: '#03314D' }).setScrollFactor(0);
		scoreText.depth = 2;

		maxScore = localStorage.getItem("maxScore") || 0;

		this.maxScoreText = this.add.text(game.config.width - 16, 16, 'Max Score: ' + maxScore, { fontFamily: '"Bruno Ace SC"', fontSize: '30px', fill: '#03314D' }).setScrollFactor(0);
		this.maxScoreText.setOrigin(1, 0);
		this.maxScoreText.depth = 2;

		GameOverText = this.add.text(game.config.width/2, game.config.height/2, 'GAME OVER', { fontFamily: '"Bruno Ace SC"', fontSize: '70px', fill: '#000'}).setScrollFactor(0);
		GameOverText.setOrigin(0.5);
		GameOverText.depth = 2;
		GameOverText.visible = false;
	
		retryText = this.add.text(game.config.width/2, game.config.height/2 + 180, 'RETRY', { fontFamily: '"Bruno Ace SC"', fontSize: '42px', fill: '#000'}).setScrollFactor(0);
		retryText.setOrigin(0.5);
		retryText.depth = 2;
		retryText.visible = false;

		this.physics.add.collider(player, floor, this.GameOver, null, this);
		this.physics.add.collider(player, tilesGroup, this.bounceBack, null, this);
		this.physics.add.collider(player, DisTilesGroup, this.TileDisappear, null, this);
		this.physics.add.overlap(player, breakTilesGroup, this.TileBreak, null, this);
		this.physics.add.collider(player, springGroup, this.BigBounce, null, this);
		this.physics.add.overlap(player, starGroup, this.pickStars, null, this);
		this.physics.add.overlap(player, enemyNgroup, this.GameOver, null, this);
		this.physics.add.overlap(player, enemySgroup, this.GameOver, null, this);
		this.physics.add.overlap(player, this.particles, this.GameOver, null, this);
		
		this.cameraYMin = 99999;
		this.tileYMin = 99999;
		
		this.key_left = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
		this.key_right = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
		this.key_Up = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
		this.input.mouse.disableContextMenu();

	}
	
	update() {
		if (score > maxScore) {
			maxScore = score;
			localStorage.setItem("maxScore", maxScore);
			this.maxScoreText.setText('Max Score: ' + maxScore);
		}
		player.yChange = Math.max( player.yChange, Math.abs( player.y - player.yOrig ) );
        this.physics.world.setBounds(0, -player.yChange, this.physics.world.bounds.width, this.game.config.height + player.yChange);
	
        this.cameras.main.setLerp(.5);
		this.cameras.main.centerOnY(player.y);
		
		if (this.key_right.isDown) player.body.velocity.x = 350;
		else if (this.key_left.isDown) player.body.velocity.x = -350;
		else if (this.key_Up.isDown) player.body.velocity.y = -350;
		else player.body.velocity.x = 0;
	
		this.physics.world.wrap(player, player.width / 6, false);

		if( player.y > this.cameraYMin + this.game.config.height ) {
			this.GameOver();
		}

		tilesGroup.children.iterate(function( item ) {
			const chance = Phaser.Math.Between(1, 100);
			const chance2 = Phaser.Math.Between(1, 100);
			const chance3 = Phaser.Math.Between(1, 100);
			let xAxis;
			const yAxis = this.tileYMin - 200;
			this.tileYMin = Math.min( this.tileYMin, item.y );
			this.cameraYMin = Math.min( this.cameraYMin, player.y - this.game.config.height + 430 );
			
			if( item.y > this.cameraYMin + this.game.config.height ){
				item.destroy();
				if (chance > 75 && chance < 81)
				{
					xAxis = Phaser.Math.Between( 100, this.physics.world.bounds.width - 100 );
					tn = this.spawnTile( xAxis, yAxis, 'tile-n');
					td = this.spawnTileDis( Phaser.Math.Between( 100, xAxis - 100 ) || Phaser.Math.Between( xAxis+100, this.physics.world.bounds.width - 100 ), Phaser.Math.Between(yAxis + 100 , yAxis - 100), 'tile-d');
				}
				else if ( chance > 80)
				{
					xAxis = Phaser.Math.Between( 100, this.physics.world.bounds.width - 100 );
					tn = this.spawnTile( xAxis, yAxis, 'tile-n');
					tb = this.spawnTileBreak( Phaser.Math.Between( xAxis + 100, this.physics.world.bounds.width - 100 ) || Phaser.Math.Between( 100, xAxis - 100 ), Phaser.Math.Between(yAxis + 100 , yAxis - 100), 'tile-b');
				}
				else if (chance < 71)
					xAxis = Phaser.Math.Between( 100, this.physics.world.bounds.width - 100 );
					tn = this.spawnTile( xAxis, yAxis, 'tile-n');
				if (chance2 > 60 && chance2 < 81) {
					this.spawnSpring(Phaser.Math.Between(xAxis - 50, xAxis + 50), yAxis - 5, 'spring')
				}
				else if (chance2 > 80) {
					this.spawnStar(Phaser.Math.Between( 100, this.physics.world.bounds.width - 100 ), Phaser.Math.Between(yAxis, yAxis - 100), 'star')	
				} 
				else if (chance2 < 61){					
				}
				if (chance3 > 80 && chance3 < 91) {
					this.spawnEnemyN(0, Phaser.Math.Between(yAxis, yAxis - 100), 'enemy-n')
				} else if (chance3 > 90){
					this.spawnEnemyS(Phaser.Math.Between( 100, this.physics.world.bounds.width - 100 ), Phaser.Math.Between(yAxis, yAxis - 100), 'enemy-s')
				}
			}
		}, this );	
	}

	createPlayer() {
        player = this.physics.add.image(game.config.width/2, game.config.height/4, 'player');
		player.setVelocity(0, -500);
		player.setGravityY(360);
		player.setBounce(0.4);
		player.body.checkCollision.up = false;
		player.depth = 1;

		player.yOrig = player.y;
        player.yChange = 0;

    }
	
    createTiles(){
        tilesGroup = this.physics.add.staticGroup({runChildUpdate: true});
		tilesGroup.enableBody = true;
		tileChild = tilesGroup.getChildren();
		
		for( var i = 0; i<5; i++){
			tn = this.spawnTile( Phaser.Math.Between( 25, this.physics.world.bounds.width - 25 ), this.physics.world.bounds.height - 200 - 200 * i, 'tile-n');
		}
	} 
	
	createBreakTiles(){
		breakTilesGroup = this.physics.add.staticGroup({runChildUpdate: true});
		breakTilesGroup.enableBody = true;
		breakTileChild = breakTilesGroup.getChildren();
	}
	
	createDisTiles(){
		DisTilesGroup = this.physics.add.staticGroup({runChildUpdate: true});
		DisTilesGroup.enableBody = true;
		DisTileChild = DisTilesGroup.getChildren();
	}

	createSpring(){
		springGroup = this.physics.add.staticGroup({runChildUpdate: true});
		springGroup.enableBody = true;
		springChild = springGroup.getChildren();
	}

	createStars(){
		starGroup = this.physics.add.staticGroup({runChildUpdate: true});
		starGroup.enableBody = true;
		starChild = starGroup.getChildren();
	}

	createEnemyN(){
		enemyNgroup = this.physics.add.group({runChildUpdate: true});
		enemyNgroup.enableBody = true;
		enemyNchild = enemyNgroup.getChildren();
	}

	createEnemyS(){
		enemySgroup = this.physics.add.group({runChildUpdate: true});
		enemySgroup.enableBody = true;
		enemySchild = enemySgroup.getChildren();
	}
	
    spawnTile(x, y, type){
		tile = tilesGroup.create(x, y, type);
		tile.setImmovable();
		return tile;
	}

    spawnTileBreak(x, y, type){
		tile = breakTilesGroup.create(x, y, type);
		tile.setImmovable();
		return tile;
	}
	
    spawnTileDis(x, y, type){
		tile = DisTilesGroup.create(x, y, type);
		tile.setImmovable();
		return tile;
	}

    spawnSpring(x, y, type){
		spring = springGroup.create(x, y, type);
		spring.setImmovable();
		return spring;
	}

    spawnStar(x, y, type){
		star = starGroup.create(x, y, type);
		star.setImmovable();
		return star;
	}

    spawnEnemyN(x, y, type){
		enemy_n = enemyNgroup.create(x, y, type);
		enemy_n.body.velocity.x = 100;
		enemy_n.setImmovable();
		return enemy_n;
	}

    spawnEnemyS(x, y, type){
		enemy_s = enemySgroup.create(x, y, type);
		particles.emitParticleAt(enemy_s.x, enemy_s.y);
		enemy_s.setImmovable();
	}

	bounceBack(_player, _tilesGroup){
		if (!scoredTiles.includes(_tilesGroup)) {
			scoredTiles.push(_tilesGroup);
			score += 10;
			scoreText.setText('Score: ' + score);
		  }
		  player.setVelocityY(-300);
	}
		
	TileDisappear(_player, _DisTilesGroup){
		DisTilesGroup.children.each(function (e) {			
			if (_player.body.touching.down && e.body.touching.up)
			{
				DisTilesGroup.remove(e, true);        
				score = score + 10;
				player.body.velocity.y = -300;
				scoreText.setText('Score: ' + score);
				
			}            		
		},this);
	}

	TileBreak(_player, _breakTilesGroup){
		breakTilesGroup.children.each(function(e){
			if (_player.body.touching.down && e.body.touching.up)
				{
					breakTilesGroup.remove(e, true);
				}            
				
			},this);
	}

	BigBounce(_player, _springGroup){
			if (_player.body.touching.down && _springGroup.body.touching.up)
				{
					score += 100;
					scoreText.setText('Score: ' + score);              
					player.body.velocity.y = -1100;
				}     
	}

	pickStars(_player, _starGroup){
		starGroup.children.each(function(e){
					score += 20;
					scoreText.setText('Score:' + score);
					e.destroy();
				
			},this);
	}

	GameOver(){
		this.fallSound.play();
		GameOverText.visible = true;
		scoreText.setPosition(this.game.config.width/2, this.game.config.height/2 + 100);
		scoreText.setFontSize(45);
		scoreText.setOrigin(0.5);

		tilesGroup.setAlpha(0);
		tilesGroup.clear();
		breakTilesGroup.setAlpha(0);
		breakTilesGroup.clear();
		DisTilesGroup.setAlpha(0);
		DisTilesGroup.clear();
		springGroup.setAlpha(0);
		springGroup.clear()
		starGroup.setAlpha(0);
		starGroup.clear();
		enemyNgroup.setAlpha(0);
		enemyNgroup.clear();
		enemySgroup.setAlpha(0);
		enemySgroup.clear();

		player.setAlpha(.45);
	}
}
