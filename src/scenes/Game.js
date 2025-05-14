import { GameConfig } from '../config.js';
/*
* Asset from: https://kenney.nl/assets/pixel-platformer
*
*/
import ASSETS from '../assets.js';
import ANIMATION from '../animation.js';
import Player from '../gameObjects/Player.js';
import PlayerBullet from '../gameObjects/PlayerBullet.js';
import EnemyFlying from '../gameObjects/EnemyFlying.js';
import EnemyBullet from '../gameObjects/EnemyBullet.js';
import Explosion from '../gameObjects/Explosion.js';
import { Continue } from './Continue.js';
export class Game extends Phaser.Scene {
    constructor() {
        super('Game');
    }

    create() {
        this.initVariables();
        this.initGameUi();
        this.initAnimations();
        this.initPlayer();
        this.initInput();
        this.initPhysics();
        this.initMap();
    }

    update() {
        this.updateMap();

        if (!this.gameStarted) return;

        // Automatic player movement
        this.player.x += this.playerMoveDirection * this.playerMoveSpeed;

        // Reverse direction if player hits screen bounds
        if (this.playerMoveDirection === 1 && this.player.x > this.scale.width - this.player.width * 0.5) {
            this.playerMoveDirection = -1;
        } else if (this.playerMoveDirection === -1 && this.player.x < this.player.width * 0.5) {
            this.playerMoveDirection = 1;
        }

        // Timed bullet firing
        this.bulletTimer--;
        if (this.bulletTimer <= 0) {
            this.fireBullet(this.player.x, this.player.y - this.player.height * 0.5);
            this.bulletTimer = this.bulletTimerDelay;
        }

        // Update bullet timer display
        this.bulletTimerText.setText(`Bullet Timer: ${Math.max(0, Math.ceil(this.bulletTimer / 60))}`); // Display in seconds

        if (this.spawnEnemyCounter > 0) this.spawnEnemyCounter--;
        else this.addFlyingGroup();
    }

    initVariables() {
        this.score = 0;
        this.centreX = this.scale.width * 0.5;
        this.centreY = this.scale.height * 0.5;

        // list of tile ids in tiles.png
        // items nearer to the beginning of the array have a higher chance of being randomly chosen when using weighted()
        this.tiles = GameConfig.map.tiles;
        this.tileSize = GameConfig.map.tileSize; // width and height of a tile in pixels

        this.mapOffset = GameConfig.map.mapOffset; // offset (in tiles) to move the map above the top of the screen
        this.mapTop = -this.mapOffset * this.tileSize; // offset (in pixels) to move the map above the top of the screen
        this.mapHeight = Math.ceil(this.scale.height / this.tileSize) + this.mapOffset + 1; // height of the tile map (in tiles)
        this.mapWidth = Math.ceil(this.scale.width / this.tileSize); // width of the tile map (in tiles)
        this.scrollSpeed = GameConfig.map.scrollSpeed; // background scrolling speed (in pixels)
        this.scrollMovement = 0; // current scroll amount
        this.spawnEnemyCounter = 0; // timer before spawning next group of enemies

        this.playerMoveDirection = 1; // 1 for right, -1 for left
        this.playerMoveSpeed = GameConfig.player.moveSpeed; // Use player move speed from config
        this.bulletTimer = 0;
        this.bulletTimerDelay = 60; // Initial delay in frames (adjust as needed)

        this.map; // rference to tile map
        this.groundLayer; // reference to ground layer of tile map
    }

    initGameUi() {
        // Create tutorial text
        this.tutorialText = this.add.text(this.centreX, this.centreY, GameConfig.ui.tutorialText.content, GameConfig.ui.tutorialText.style)
            .setOrigin(GameConfig.ui.tutorialText.origin)
            .setDepth(GameConfig.ui.tutorialText.depth);

        // Create score text
        this.scoreText = this.add.text(GameConfig.ui.scoreText.position.x, GameConfig.ui.scoreText.position.y, GameConfig.ui.scoreText.content, GameConfig.ui.scoreText.style)
            .setDepth(GameConfig.ui.scoreText.depth);

        // Create bullet timer text
        this.bulletTimerText = this.add.text(GameConfig.ui.scoreText.position.x, GameConfig.ui.scoreText.position.y + 40, 'Bullet Timer: 0', GameConfig.ui.scoreText.style)
            .setDepth(GameConfig.ui.scoreText.depth);

        // Create game over text
        this.gameOverText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, GameConfig.ui.gameOverText.content, GameConfig.ui.gameOverText.style)
            .setOrigin(GameConfig.ui.gameOverText.origin)
            .setDepth(GameConfig.ui.gameOverText.depth)
            .setVisible(false)
            .setInteractive(); // Make the text interactive
        
        // Add a pointerup listener to restart the game on click
        this.gameOverText.on('pointerup', () => {
            this.scene.restart();
        });
    }

    initAnimations() {
        this.anims.create({
            key: ANIMATION.explosion.key,
            frames: this.anims.generateFrameNumbers(ANIMATION.explosion.texture, ANIMATION.explosion.config),
            frameRate: ANIMATION.explosion.frameRate,
            repeat: ANIMATION.explosion.repeat
        });
    }

    initPhysics() {
        this.enemyGroup = this.add.group();
        this.enemyBulletGroup = this.add.group();
        this.playerBulletGroup = this.add.group();

        this.physics.add.overlap(this.player, this.enemyBulletGroup, this.hitPlayer, null, this);
        this.physics.add.overlap(this.playerBulletGroup, this.enemyGroup, this.hitEnemy, null, this);
        this.physics.add.overlap(this.player, this.enemyGroup, this.hitPlayer, null, this);
    }

    initPlayer() {
        this.player = new Player(this, this.centreX, this.scale.height - GameConfig.player.initialYOffset, GameConfig.player.initialHealth);
    }

    initInput() {
        // check for spacebar press only once to start the game
        this.input.keyboard.once('keydown-SPACE', (event) => {
            this.startGame();
        });
    }

    // create tile map data
    initMap() {
        const mapData = [];

        for (let y = 0; y < this.mapHeight; y++) {
            const row = [];

            for (let x = 0; x < this.mapWidth; x++) {
                // randomly choose a tile id from this.tiles
                // weightedPick favours items earlier in the array
                const tileIndex = Phaser.Math.RND.weightedPick(this.tiles);

                row.push(tileIndex);
            }

            mapData.push(row);
        }
        this.map = this.make.tilemap({ data: mapData, tileWidth: this.tileSize, tileHeight: this.tileSize });
        const tileset = this.map.addTilesetImage(ASSETS.spritesheet.tiles.key);
        this.groundLayer = this.map.createLayer(0, tileset, 0, this.mapTop);
    }

    // scroll the tile map
    updateMap() {
        this.scrollMovement += this.scrollSpeed;

        if (this.scrollMovement >= this.tileSize) {
            //  Create new row on top
            let tile;
            let prev;

            // loop through map from bottom to top row
            for (let y = this.mapHeight - 2; y > 0; y--) {
                // loop through map from left to right column
                for (let x = 0; x < this.mapWidth; x++) {
                    tile = this.map.getTileAt(x, y - 1);
                    prev = this.map.getTileAt(x, y);

                    prev.index = tile.index;

                    if (y === 1) { // if top row
                        // randomly choose a tile id from this.tiles
                        // weightedPick favours items earlier in the array
                        tile.index = Phaser.Math.RND.weightedPick(this.tiles);
                    }
                }
            }

            this.scrollMovement -= this.tileSize; // reset to 0
        }

        this.groundLayer.y = this.mapTop + this.scrollMovement; // move one tile up
    }

    startGame() {
        this.gameStarted = true;
        this.tutorialText.setVisible(false);
        this.addFlyingGroup();
    }

    fireBullet(x, y) {
        const bullet = new PlayerBullet(this, x, y);
        this.playerBulletGroup.add(bullet);
    }

    removeBullet(bullet) {
        this.playerBulletGroup.remove(bullet, true, true);
    }

    fireEnemyBullet(x, y, power) {
        const bullet = new EnemyBullet(this, x, y, power);
        this.enemyBulletGroup.add(bullet);
    }

    removeEnemyBullet(bullet) {
        this.playerBulletGroup.remove(bullet, true, true);
    }

    // add a group of flying enemies
    addFlyingGroup() {
        this.spawnEnemyCounter = Phaser.Math.RND.between(GameConfig.enemy.spawnTimerRange.min, GameConfig.enemy.spawnTimerRange.max); // spawn next group after x seconds
        const randomId = Phaser.Math.RND.between(0, 11); // id to choose image in tiles.png - This could also be moved to config
        const randomCount = Phaser.Math.RND.between(GameConfig.enemy.groupCountRange.min, GameConfig.enemy.groupCountRange.max); // number of enemies to spawn
        const randomInterval = Phaser.Math.RND.between(GameConfig.enemy.spawnIntervalRange.min, GameConfig.enemy.spawnIntervalRange.max); // delay between spawning of each enemy
        const randomPath = Phaser.Math.RND.between(0, 3); // choose a path, a group follows the same path - This could also be moved to config
        const randomPower = Phaser.Math.RND.between(GameConfig.enemy.powerRange.min, GameConfig.enemy.powerRange.max); // strength of the enemy to determine damage to inflict and selecting bullet image
        const randomSpeed = Phaser.Math.RND.realInRange(GameConfig.enemy.speedRange.min, GameConfig.enemy.speedRange.max); // increment of pathSpeed in enemy

        this.timedEvent = this.time.addEvent(
            {
                delay: randomInterval,
                callback: this.addEnemy,
                args: [randomId, randomPath, randomSpeed, randomPower], // parameters passed to addEnemy()
                callbackScope: this,
                repeat: randomCount
            }
        );
    }

    addEnemy(shipId, pathId, speed, power) {
        const enemy = new EnemyFlying(this, shipId, pathId, speed, power);
        this.enemyGroup.add(enemy);
    }

    removeEnemy(enemy) {
        this.enemyGroup.remove(enemy, true, true);
    }

    addExplosion(x, y) {
        new Explosion(this, x, y);
    }

    hitPlayer(player, obstacle) {
        this.addExplosion(player.x, player.y);
        player.hit(obstacle.getPower());
        obstacle.die();

        this.GameOver();
    }

    hitEnemy(bullet, enemy) {
        this.updateScore(10);
        bullet.remove();
        enemy.hit(bullet.getPower());
    }

    updateScore(points) {
        this.score += points;
        this.scoreText.setText(`Score: ${this.score}`);
        // Increase bullet timer delay for every 50 points
        if (this.score > 0 && this.score % 50 === 0) {
            this.bulletTimerDelay += 1;
        }
    }

    GameOver() {
        this.gameStarted = false;
        // Pause the game scene and launch the Continue scene, passing the game scene instance
        this.scene.pause('Game');
        this.scene.launch('Continue', { gameScene: this });
    }

    spawnNewShip() {
        // Remove the old player if it exists
        if (this.player) {
            this.player.destroy();
        }
        // Create a new player instance
        this.initPlayer();
        // Reset score and bullet timer for a fresh start after continuing
        this.score = 0;
        this.scoreText.setText(`Score: ${this.score}`);
        this.bulletTimer = 0;
        this.bulletTimerDelay = 60;
        this.bulletTimerText.setText(`Bullet Timer: ${Math.max(0, Math.ceil(this.bulletTimer / 60))}`);
        this.gameStarted = true; // Start the game loop again
    }
}
