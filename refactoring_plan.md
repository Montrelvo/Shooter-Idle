# Code Refactoring Plan: Externalizing Configuration

## Objective
Analyze the code in the 'Shooter Idle' project and propose changes to make it easier to modify by externalizing game parameters and configurations.

## Plan

1.  **Create a Configuration File:** Create a new file at `src/config.js`.
2.  **Define Configuration Object:** Add a JavaScript object to `src/config.js` that will hold all the externalized parameters.
3.  **Populate Configuration:** Extract the following hardcoded values from `src/scenes/Game.js` and add them to the configuration object in `src/config.js`:
    *   `tiles` array (line 45)
    *   `tileSize` (line 46)
    *   `mapOffset` (line 48)
    *   `scrollSpeed` (line 52)
    *   Enemy spawning parameters: `spawnEnemyCounter` initial value (line 200), `randomCount` range (line 202), `randomInterval` range (line 203), `randomSpeed` range (line 206), `randomPower` range (line 205).
    *   Player initial position (`centreX`, `scale.height - 100`) and initial health (8) (line 108).
    *   UI text content, font styles, colors, stroke, and positions (lines 62-85).
4.  **Update Game Scene:** Modify `src/scenes/Game.js` to import the configuration object from `src/config.js` and use its properties for all the externalized values.
5.  **Refactor Enemy Spawning (Optional but Recommended):** Consider refactoring the `addFlyingGroup` and `addEnemy` methods to potentially use a more structured configuration for different enemy types, rather than just ranges for random values. This could involve defining enemy types in the config with specific sprites, speeds, power, etc. (We can refine this part during implementation).

## Diagram

```mermaid
graph TD
    A[src/main.js] --> B[src/scenes/Boot.js]
    A --> C[src/scenes/Preloader.js]
    A --> D[src/scenes/Start.js]
    A --> E[src/scenes/Game.js]
    A --> F[src/scenes/GameOver.js]
    C --> G[src/assets.js]
    E --> G
    E --> H[src/animation.js]
    E --> I[src/gameObjects/Player.js]
    E --> J[src/gameObjects/PlayerBullet.js]
    E --> K[src/gameObjects/EnemyFlying.js]
    E --> L[src/gameObjects/EnemyBullet.js]
    E --> M[src/gameObjects/Explosion.js]
    E --> N[src/config.js] %% New dependency

    Subgraph Existing
    A
    B
    C
    D
    E
    F
    G
    H
    I
    J
    K
    L
    M
    End
    Subgraph Proposed
    N
    End