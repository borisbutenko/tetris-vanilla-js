import Game from "./src/Game.js"
import View from "./src/View.js"
import Controller from "./src/Controller.js"

/**
 * Game field view.cols x view.rows
 * @see https://en.wikipedia.org/wiki/Tetris#Gameplay
 * @see https://tetris.com/
 */
const [cols, rows] = [10, 20]

const game = new Game(cols, rows)
const view = new View(document.querySelector("canvas"), cols, rows)

window.controller = new Controller(game, view)
