class View {
    static border_width = 4

    static colors = {
        0: "#000",      // black
        1: "#0FF",      // cyan
        2: "#00F",      // blue
        3: "#FFA500",   // orange
        4: "#FF0",      // yellow
        5: "#0F0",      // green
        6: "#800080",   // purple
        7: "#F00",      // red
        8: "#FFF",      // white
    }

    get game_field_size () {
        let [outer_width, outer_height] = [this.canvas.width * 2 / 3, this.canvas.height]
        return {
            outer_width,
            outer_height,
            inner_width: outer_width - View.border_width * 2,
            inner_height: outer_height - View.border_width * 2,
        }
    }

    get block_size () {
        return {
            width: this.game_field_size.inner_width / this.cols,
            height: this.game_field_size.inner_height / this.rows,
        }
    }

    get panel () {
        return {
            x: this.game_field_size.outer_width + 10,
            y: 0,
            width: this.canvas.width / 3,
            height: this.canvas.height,
        }
    }

    constructor (canvas, cols, rows) {
        this.canvas = canvas
        this.cols = cols
        this.rows = rows
        this.ctx = this.canvas.getContext("2d")
    }

    render_screen (screen_name, ...rest) {
        switch (screen_name) {
            case "start": this.render_start_screen(...rest); break
            case "game":  this.render_game_screen(...rest);  break
            case "pause": this.render_pause_screen(...rest); break
            case "end":   this.render_end_screen(...rest);   break
            default: break
        }
    }

    render_start_screen () {
        this.ctx.fillStyle = View.colors[0]
        this.ctx.font = "18px \"Press Start 2P\""
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText("Press ENTER to start!",
                          this.canvas.width / 2,
                          this.canvas.height / 2)
    }

    render_game_screen (game_state) {
        this.clear_screen()
        this.render_game_field(game_state)
        this.render_panel(game_state)
    }

    render_pause_screen () {
        this.ctx.fillStyle = `rgba(0, 0, 0, 0.75)` // black with 0.75 opacity
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = View.colors[8]
        this.ctx.font = "18px \"Press Start 2P\""
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"
        this.ctx.fillText("Press ENTER to resume!", this.canvas.width / 2, this.canvas.height / 2)
    }

    render_end_screen ({ score }) {
        this.clear_screen()

        this.ctx.fillStyle = View.colors[0]
        this.ctx.font = "18px \"Press Start 2P\""
        this.ctx.textAlign = "center"
        this.ctx.textBaseline = "middle"

        this.ctx.fillText("Game over!",
                          this.canvas.width / 2,
                          this.canvas.height / 2 - 24 * 2)
        this.ctx.fillText(`Score: ${score}`,
                          this.canvas.width / 2,
                          this.canvas.height / 2)
        this.ctx.fillText("Press ENTER to start new game",
                          this.canvas.width / 2,
                          this.canvas.height / 2 + 24 * 2)
    }

    render_game_field ({ field }) {
        for (let y = 0, len_y = field.length; y < len_y; y += 1) {
            for (let x = 0, len_x = field[y].length; x < len_x; x += 1) {
                if (field[y][x]) {
                    this.render_game_block(View.colors[field[y][x]],
                                           View.border_width + x * this.block_size.width,
                                           View.border_width + y * this.block_size.height,
                                           this.block_size.width,
                                           this.block_size.height)
                }
            }
        }

        this.ctx.strokeStyle = View.colors[0]
        this.ctx.lineWidth = View.border_width
        this.ctx.strokeRect(0,
                            0,
                            this.game_field_size.outer_width,
                            this.game_field_size.outer_height)
    }

    render_game_block (color, ...rest) {
        this.ctx.fillStyle = color
        this.ctx.strokeStyle = View.colors[0]
        this.ctx.lineWidth = View.border_width / 2
        this.ctx.fillRect(...rest)
        this.ctx.strokeRect(...rest)
    }

    render_panel ({ level, lines, score, next_piece: { blocks } }) {
        this.ctx.fillStyle = View.colors[0]
        this.ctx.textAlign = "start"
        this.ctx.textBaseline = "top"
        this.ctx.font = "14px \"Press Start 2P\""

        this.ctx.fillText(`Level: ${level}`, this.panel.x, this.panel.y)
        this.ctx.fillText(`Lines: ${lines}`, this.panel.x, this.panel.y + 24)
        this.ctx.fillText(`Score: ${score}`, this.panel.x, this.panel.y + 24 * 2)
        this.ctx.fillText("Next:", this.panel.x, this.panel.y + 24 * 3)

        for (let y = 0, len_y = blocks.length; y < len_y; y += 1) {
            for (let x = 0, len_x = blocks[y].length; x < len_x; x += 1) {
                if (blocks[y][x]) {
                    this.render_game_block(View.colors[blocks[y][x]],
                                           x * this.block_size.width * 0.5 + this.panel.x,
                                           y * this.block_size.height * 0.5 + this.panel.y + 100,
                                           this.block_size.width * 0.5,
                                           this.block_size.height * 0.5)
                }
            }
        }
    }

    clear_screen () {
        this.ctx.clearRect(0,
                           0,
                           this.canvas.width,
                           this.canvas.height)
    }
}

export default View
