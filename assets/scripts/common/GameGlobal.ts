import Game from "../game/Game";

declare global {
    export let App: Game;
    interface Window {
        App: Game;
    }
}

function initGame() {
    console.log("游戏初始化");
    window.App = new Game();
    App.init();
}

initGame();