import EventEmitter from "./EventEmitter.js"

class Game {
    static pieces = {
        1: [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
        ],
        2: [
            [0, 0, 0, 0],
            [2, 2, 2, 0],
            [0, 0, 2, 0],
            [0, 0, 0, 0],
        ],
        3: [
            [0, 0, 0, 0],
            [3, 3, 3, 0],
            [3, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        4: [
            [0, 0, 0, 0],
            [0, 4, 4, 0],
            [0, 4, 4, 0],
            [0, 0, 0, 0],
        ],
        5: [
            [0, 0, 0, 0],
            [0, 5, 5, 0],
            [5, 5, 0, 0],
            [0, 0, 0, 0],
        ],
        6: [
            [0, 0, 0, 0],
            [6, 6, 0, 0],
            [0, 6, 6, 0],
            [0, 0, 0, 0],
        ],
        7: [
            [0, 7, 0, 0],
            [7, 7, 7, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
    }

    static points = {
        1: 40,
        2: 100,
        3: 300,
        4: 1200,
    }

    lines = 0

    score = 0

    top_out = false

    get level () {
        return Math.ceil(this.lines * 0.1) + 1
    }

    get state () {
        let { coords: [piece_x, piece_y], blocks } = this.pieces.active
        let field_copy = Array.from({ length: this.rows }, (_, idx) => this.field[idx].slice())

        let y = blocks.length
        while (y--) {
            let x = blocks[y].length
            while (x--) {
                if (blocks[y][x]) {
                    field_copy[piece_y + y][piece_x + x] = blocks[y][x]
                }
            }
        }

        return {
            level: this.level,
            score: this.score,
            lines: this.lines,
            next_piece: this.pieces.next,
            is_over: this.top_out,
            field: field_copy,
        }
    }

    constructor (cols, rows) {
        this.cols = cols
        this.rows = rows
        this.pieces = {
            active: this.create_piece(),
            next: this.create_piece(),
        }
        this.create_field()
    }

    create_field () {
        this.field = Array.from({ length: this.rows }, () => Array(this.cols).fill(0))
    }

    create_piece () {
        let idx = Math.floor(Math.random() * Object.keys(Game.pieces).length) + 1
        let blocks = Game.pieces[idx].map(line => line.slice())
        return {
            blocks,
            coords: [Math.floor((this.cols - blocks[0].length) / 2), 0],
        }
    }

    update_piece () {
        this.pieces.active = this.pieces.next
        this.pieces.next = this.create_piece()
    }

    move_piece (dir) {
        if (this.top_out) {
            return
        }

        switch (dir) {
            case "right": !this.has_collision(1) && this.pieces.active.coords[0]++; break
            case "left": !this.has_collision(-1) && this.pieces.active.coords[0]--; break
            case "down":
                if (this.has_collision(0, 1)) {
                    this.lock_piece()
                    this.update_score(this.clear_lines())
                    this.update_piece()
                } else {
                    this.pieces.active.coords[1] += 1
                }
                if (this.has_collision()) {
                    EventEmitter.emit("game-over", this.top_out = true);
                }
                break
            default: break
        }
    }

    rotate_piece () {
        let rotate_piece = (clockwise = true) => {
            for (let i = 0, matrix = this.pieces.active.blocks, y = matrix.length - 1, x = matrix.length / 2; i < x; i += 1) {
                for (let j = 0; j <= x / 2; j += 1) {
                    if (clockwise) {
                        [matrix[i][j], matrix[y - j][i], matrix[y - i][y - j], matrix[j][y - i]] = [
                            matrix[y - j][i], matrix[y - i][y - j], matrix[j][y - i], matrix[i][j]]
                    } else {
                        [matrix[y - j][i], matrix[y - i][y - j], matrix[j][y - i], matrix[i][j]] = [
                            matrix[i][j], matrix[y - j][i], matrix[y - i][y - j], matrix[j][y - i]]
                    }
                }
            }

            return this.has_collision()
        }

        rotate_piece() && rotate_piece(false)
    }

    lock_piece () {
        let { coords: [piece_x, piece_y], blocks } = this.pieces.active
        let y = blocks.length

        while (y--) {
            let x = blocks[y].length

            while (x--) {
                if (blocks[y][x]) {
                    this.field[piece_y + y][piece_x + x] = blocks[y][x]
                }
            }
        }
    }

    has_collision (offset_x = 0, offset_y = 0) {
        let has_collision = false
        let { coords: [piece_x, piece_y], blocks } = this.pieces.active
        let y = blocks.length

        loop: while (y--) {
            let x = blocks[y].length

            while (x--) {
                let col = this.field[piece_y + y + offset_y]
                let get_line = () => col[piece_x + x + offset_x]

                if (blocks[y][x] && ((col === undefined || get_line() === undefined) || get_line())) {
                    has_collision = true
                    break loop
                }
            }
        }

        return has_collision
    }

    clear_lines () {
        let [y, lines] = [this.rows, []]

        while (y--) {
            let [x, num_blocks] = [this.cols, 0]

            while (x--) {
                if (this.field[y][x]) {
                    num_blocks += 1
                }
            }

            if (!num_blocks) {
                break
            }

            if (num_blocks < this.cols) {
                continue
            }

            lines.unshift(y)
        }

        for (let idx of lines) {
            this.field.splice(idx, 1)
            this.field.unshift(Array(this.cols).fill(0))
        }

        return lines.length
    }

    update_score (lines) {
        if (!lines) {
            return
        }

        this.score += Game.points[lines] * this.level
        this.lines += lines
    }

    reset () {
        this.lines = 0
        this.score = 0
        this.top_out = false
        this.create_field()
    }
}

export default Game
