export class Continue extends Phaser.Scene {
    constructor() {
        super('Continue');
    }

    create(data) {
        // Receive the Game scene instance
        this.gameScene = data.gameScene;

        this.continueText = this.add.text(this.scale.width * 0.5, this.scale.height * 0.5, 'Continue?', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5)
        .setInteractive(); // Make the text interactive

        // Add a pointerup listener to spawn a new ship and resume the game
        this.continueText.on('pointerup', () => {
            this.gameScene.spawnNewShip(); // Call a method in Game scene to spawn a new ship
            this.scene.stop('Continue'); // Stop the Continue scene
            this.scene.resume('Game'); // Resume the Game scene
        });
    }
}
