export const GameConfig = {
    map: {
        tiles: [50, 50, 50, 50, 50, 50, 50, 50, 50, 110, 110, 110, 110, 110, 50, 50, 50, 50, 50, 50, 50, 50, 50, 110, 110, 110, 110, 110, 36, 48, 60, 72, 84],
        tileSize: 32,
        mapOffset: 10,
        scrollSpeed: 1,
    },
    enemy: {
        spawnTimerRange: { min: 5 * 60, max: 8 * 60 }, // in frames (60 frames = 1 second)
        groupCountRange: { min: 5, max: 15 },
        spawnIntervalRange: { min: 8 * 100, max: 12 * 100 }, // in milliseconds
        speedRange: { min: 0.0001, max: 0.001 },
        powerRange: { min: 1, max: 4 },
    },
    player: {
        initialHealth: 8,
        initialYOffset: 100, // offset from bottom of screen
    },
    ui: {
        tutorialText: {
            content: 'Tap to shoot!',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 42,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center'
            },
            origin: 0.5,
            depth: 100,
        },
        scoreText: {
            content: 'Score: 0',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 28,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
            },
            position: { x: 20, y: 20 },
            depth: 100,
        },
        gameOverText: {
            content: 'Game Over',
            style: {
                fontFamily: 'Arial Black',
                fontSize: 64,
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 8,
                align: 'center'
            },
            origin: 0.5,
            depth: 100,
        },
    },
};