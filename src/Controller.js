import EventEmitter from "./EventEmitter.js"

class Controller {
    interval_id = null

    is_paused = true

    get speed () {
        return this.game.level < 10
            ? 1000 - this.game.level * 100
            : 100 - this.game.level
    }

    get game_state () {
        return this.game.state
    }

    constructor (game, view) {
        this.game = game
        this.view = view
        this.view.render_screen("start")
        this.handle_keydown()
        this.handle_game_over()
    }

    handle_keydown () {
        document.onkeydown = ({ key }) => {
            switch (key) {
                case "Enter":
                    if (this.is_paused) {
                        if (this.game.top_out) {
                            this.game.reset()
                        }
                        this.play()
                    } else {
                        this.pause()
                    }
                    break
                case "Pause":
                    if (!this.is_paused && !this.game_state.is_over) {
                        this.pause()
                    }
                    break
                case "ArrowUp":
                    if (!this.is_paused && !this.game_state.is_over) {
                        this.game.rotate_piece()
                        this.view.render_screen("game", this.game_state)
                    }
                    break
                case "ArrowDown":
                case "ArrowRight":
                case "ArrowLeft":
                    if (this.game_state.is_over) {
                        return
                    }

                    let [dir] = key.toLowerCase().match(/right|down|left/g)
                    if (!this.is_paused) {
                        if (dir === "down") {
                            this.stop_timer()
                        }

                        this.game.move_piece(dir)

                        if (this.game_state.is_over) {
                            return
                        }

                        this.view.render_screen("game", this.game_state)

                        if (dir === "down") {
                            this.start_timer()
                        }
                    }
                    break
                default: break
            }
        }
    }

    handle_game_over () {
        EventEmitter.on("game-over", this.end.bind(this))
    }

    play () {
        this.is_paused = false
        this.view.render_screen("game", this.game_state)
        this.start_timer()
    }

    pause () {
        this.is_paused = true
        this.view.render_screen("pause")
        this.stop_timer()
    }

    end () {
        this.is_paused = true
        this.view.render_screen("end", this.game_state)
        this.stop_timer()
    }

    update_view () {
        this.game.move_piece("down")
        this.view.render_screen("game", this.game_state)

        if (this.game_state.is_over) {
            this.end()
        }
    }

    start_timer () {
        this.interval_id = setInterval(this.update_view.bind(this), this.speed)
    }

    stop_timer () {
        clearInterval(this.interval_id)
    }
}

export default Controller
