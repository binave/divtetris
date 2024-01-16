/*
 * Copyright (c) 2024 bin jin.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @param max {number}
 * @returns {number}
 */
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

/**
 * 多个洗牌算法相连，且相邻两个数字不重复
 * @param {number} size
 * @returns {Generator<number, void, unknown>}
 */
function* Shuffle(size) {
    let head;
    while (true) {
        let poker = Array.from({ length: size }, (v, i) => i * 1);
        for (let i = size - 1; i >= 0; i--) {
            let ri;
            do {
                ri = Math.floor(Math.random() * (i + 1));
            } while (i == size - 1 && head == poker[ri])
            yield poker[ri];
            poker[ri] = poker[i];
            if (i == 0) { head = poker[0]; }
        }
    }
}


class Cell {
    /** @type {number} */
    x;

    /** @type {number} */
    y;

    /** @type {number} */
    style;

    /**
     * @param x {number}
     * @param y {number}
     * @param style {number}
     */
    constructor(x, y, style) {
        this.init(x, y, style);
    }

    /**
     * @param x {number}
     * @param y {number}
     * @param style {number}
     * @returns {Cell}
     */
    init(x, y, style) {
        this.y = y;
        this.x = x;
        this.style = style;
    }

    toString() {
        return `{x:${this.x}, y:${this.y}, s:${this.style}}`
    }

}

/**
 * 每个形状
 */
class Tetromino {

    /** @type {Array<Cell>} */
    cells;

    /** @type {Array<boolean>} */
    banMoves;

    constructor() {
        this.cells = Array.from({ length: 4 }, () => new Cell()); // 初始化4个cell
    }

    /**
     * 随机 7 种形状和若干颜色
     *
     * 除了 I 型以外，其他六种形状都会占用三行两列。
     *
     * 将“用 2 个点将 3x2 矩阵分割成两半”的情况排除掉，剩下的排列就可以组成 L T Z O 四种方块之一。
     * 其中 O 概率上会多一倍，强制降低即可。
     *
     * O O .  O . O  . O O  O . .  O . .  . . O  . . O  + + +  . X .  . X .  . X .
     * . . .  . . .  . . .  O . .  . . O  O . .  . . O  + . +  X . .  . X .  . . X
     *
     * . . .  . . .  . . .  O . .  . . O  O . .  . . O  + . +  X . .  . X .  . . X
     * O O .  O . O  . O O  O . .  O . .  . . O  . . O  + + +  . X .  . X .  . X .
     *
     * @param {number} style
     */
    init(style) {
        this.banMoves = [false, false, false, false]; // up right down lefft

        let non_y1, non_x1, non_y2, non_x2, times = 0;

        do {
            if (++times > 3) { // 当重复次数超过三次生成 I 型
                for (let x = 0; x < this.cells.length; x++) {
                    this.cells[x].init(x, 0, style);
                }
                return;
            }
            non_x1 = getRandomInt(3), non_x2 = getRandomInt(3),
                non_y1 = getRandomInt(2), non_y2 = getRandomInt(2);

        } while (
            (non_x1 == non_x2 && non_y1 == non_y2) ||
            (non_y1 != non_y2 && (
                Math.abs(non_x1 - non_x2) == 1 ||
                (non_x1 == non_x2 && non_x1 != 2)
            ))
        )


        let i = 0;
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 2; y++) {
                if (!((x === non_x1 && y === non_y1) || (x === non_x2 && y === non_y2))) {
                    this.cells[i++].init(x, y, style);
                }
            }
        }

        // let non_row = 0, non_colume = 0, times = 0;
        // let chirality = getRandomInt(2) === 0 ? 0 : 2; // 决定方块朝向
        //
        // do {
        //     if (++times > 2) { // 当重复次数超过三次生成 I 型
        //         for (let colume = 0; colume < this.cells.length; colume++) {
        //             this.cells[colume].init(0, colume, style);
        //         }
        //         return;
        //     }
        //     non_row = getRandomInt(2), non_colume = getRandomInt(3); // 确定 row = colume = 0 以外的另一个需要排除的点。
        //
        // } while (
        //     (non_row === 1 && non_colume === 1) ||
        //     (non_row === 0 && non_colume === chirality)
        // );
        //
        // let i = 0;
        // for (let row = 0; row < 2; row++) { // 刨去排除的点，产生正反 Z L O T 之一
        //     for (let colume = 0; colume < 3; colume++) {
        //         if (!(row === non_row && colume === non_colume || row === 0 && colume === chirality)) {
        //             this.cells[i++].init(row, colume, style);
        //         }
        //     }
        // }

        // return this; // bug: [new Tetromino().init(), new Tetromino().init()]: random undefined

    }

    /**
     * @param x {number}
     * @param y {number}
     */
    moveBy(x, y) {
        this.cells.forEach(cell => {
            cell.x += x;
            cell.y += y;
        });
    }

    /**
     * 旋转
     * 3 x 3 的矩阵
     * 顺时针旋转 90 度：交换 y 与 x 的坐标并上下翻转。
     * 逆时针旋转 90 度：交换 y 与 x 的坐标并左右翻转。
     * 在交换过程中需要减去与 0,0 的间距，
     * 在 0,0 点交换 y 与 x 会得到与目标图样颠倒的图样，
     * 然后用 0 减去 x 或 y，再将间距加回来。
     * 再移动回原来的位置即可实现旋转。
     *
     * @param counterclockwise {boolean}
     */
    rotate(counterclockwise) {
        let min_x = this.cells[0].x, min_y = this.cells[0].y;
        for (let i = 1; i < this.cells.length; i++) {
            min_x = Math.min(this.cells[i].x, min_x);
            min_y = Math.min(this.cells[i].y, min_y);
        }

        let emptyCol0 = 0;
        this.cells.forEach(cell => {
            let old_cell_x = cell.x;
            cell.x = (counterclockwise ? cell.y - min_y : 2 - (cell.y - min_y)) + min_x;
            cell.y = (!counterclockwise ? old_cell_x - min_x : 2 - (old_cell_x - min_x)) + min_y;
            emptyCol0 += min_x != cell.x ? 1 : 0;
        });

        if (emptyCol0 == this.cells.length) { // 如果左一列均为空，方块左移
            this.moveBy(-1, 0);
        }
    }


    toString() {
        return `{cells:[${this.cells}], banMoves:[${this.banMoves}]}`
    }


}


/**
 *    |-- width: 4 --|
 * 0,0                 5,0 _
 * 0,1                 5,1 |
 * 0,2       O         5,2 |
 * 0,3   O O O         5,3 | height: 7
 * 0,4                 5,4 |
 * 0,5                 5,5 |
 * 0,6                 5,6 -
 * 0,7 1,7 2,7 3,7 4,7 5,7
 */

class Background {

    /** @type {Generator<number, void, unknown>} 随机不重复数字 */
    #loopRan;

    /**
     * @type {Array<number>}
     * [x, y]
    */
    #ARROW = [0, 0];

    static WIDTH = 10; static HEIGHT = 20;

    static #BG_OFFSET = 1;

    static #BG_TIMES = 8;
    // static #BG_TIMES = 3;

    /** @type {Array<Tetromino>} */
    #dual_tetromino;

    /** @type {number} */
    #tetrisIndex = 0;

    /** @type {Tetromino} */
    #current_tetris;

    /** @type {Array<Array<number>>} */
    #current_cellsStyle;

    /** @type {number} */
    #autoDropSum = 8;

    /** @param {GlobalEventHandlers} element */
    constructor(element) {
        this.#loopRan = Shuffle(4);
        this.#dual_tetromino = [new Tetromino(), new Tetromino()];
        this.#dual_tetromino[0].init(this.#loopRan.next().value);
        this.#dual_tetromino[1].init(this.#loopRan.next().value);
        this.#current_tetris = this.#dual_tetromino[this.#tetrisIndex];

        let cellsStyle = new Array();
        for (let y = 0; y < Background.HEIGHT + Background.#BG_OFFSET; y++) {
            cellsStyle[y] = new Array();
            if (y == Background.HEIGHT + Background.#BG_OFFSET - 1) {
                for (let x = 0; x <= Background.WIDTH + Background.#BG_OFFSET; x++) { cellsStyle[y][x] = -1; }

            } else {
                for (const x of [0, Background.WIDTH + Background.#BG_OFFSET]) { cellsStyle[y][x] = -1; }
                for (let x = 1; x <= Background.WIDTH; x++) { cellsStyle[y][x] = -3; }

            }
        }
        this.#current_cellsStyle = cellsStyle;

        element.addEventListener("keyup", (event) => this.#keyUpDown(event, true, this.#ARROW), true);
        element.addEventListener("keydown", (event) => this.#keyUpDown(event, false, this.#ARROW), true);

        this.#current_tetris.moveBy(5, -1);
    }

    /**
     * @param {KeyboardEvent} event
     * @param {boolean} isKeyUp
     * @param {Array<number>} arrow
     */
    #keyUpDown(event, isKeyUp, arrow) {
        switch (event.code) {
            case "ArrowUp": arrow[1] = isKeyUp ? 0 : 1; break;
            case "ArrowDown": arrow[1] = isKeyUp ? 0 : -1; break;
            case "ArrowLeft": arrow[0] = isKeyUp ? 0 : -1; break;
            case "ArrowRight": arrow[0] = isKeyUp ? 0 : 1; break;
        }

    }

    init() {
        this.#exchangeTetromino();
        for (let y = 0; y < Background.HEIGHT; y++) {
            for (let x = 1; x <= Background.WIDTH; x++) {
                this.#current_cellsStyle[y][x] = -3;
            }
        }
    }

    #exchangeTetromino() {
        this.#current_tetris.init(this.#loopRan.next().value);
        this.#tetrisIndex = 1 - this.#tetrisIndex;
        this.#current_tetris = this.#dual_tetromino[this.#tetrisIndex];
        this.#current_tetris.moveBy(5, -1);

    }

    /**
     *
     * @returns {Array<boolean>}
     */
    #aabb() {
        const tetris = this.#current_tetris;
        tetris.banMoves.fill(false);
        for (const cell of tetris.cells) {

            if (this.#current_cellsStyle[cell.y] != undefined &&
                this.#current_cellsStyle[cell.y][cell.x] > -2) {
                tetris.banMoves.fill(true);

            } else {
                tetris.banMoves = [
                    tetris.banMoves[0] || (this.#current_cellsStyle[cell.y - 1] != undefined &&
                        this.#current_cellsStyle[cell.y - 1][cell.x] > -2),
                    tetris.banMoves[1] || (this.#current_cellsStyle[cell.y] != undefined &&
                        this.#current_cellsStyle[cell.y][cell.x + 1] > -2),
                    tetris.banMoves[2] || (this.#current_cellsStyle[cell.y + 1] != undefined &&
                        this.#current_cellsStyle[cell.y + 1][cell.x] > -2),
                    tetris.banMoves[3] || (this.#current_cellsStyle[cell.y] != undefined &&
                        this.#current_cellsStyle[cell.y][cell.x - 1] > -2)
                ]
            }

        }
        return tetris.banMoves;
    }

    #subLine() {
        let sub_sum = 0;
        for (let y = Background.HEIGHT - Background.#BG_OFFSET; y >= 0; y--) {
            let cell_sum = 0;
            for (let x = 1; x <= Background.WIDTH; x++) {
                if (this.#current_cellsStyle[y][x] >= 0) { cell_sum++; }
            }
            if (cell_sum == Background.WIDTH) {
                sub_sum++;
                let styleArr = this.#current_cellsStyle[y];
                styleArr.fill(-3);
                styleArr[0] = -1;
                styleArr[styleArr.length - 1] = -1;
                this.#current_cellsStyle.splice(y++, 1);
                this.#current_cellsStyle.unshift(styleArr);

            }

            if (cell_sum == 0) { break; }

        }
    }

    /**
     * @param {BackgroundLog} backgroundLog
     * @returns {Array<Array<Cell>>}
     */
    run1Step(backgroundLog) {
        const tetris = this.#current_tetris;
        this.#aabb();

        if (this.#autoDropSum++ >= Background.#BG_TIMES) {
            if (!tetris.banMoves[2]) {
                tetris.moveBy(0, 1);
                this.#aabb();
            }
            this.#autoDropSum = 0;
        }

        if (tetris.banMoves[2]) {
            let game_over = false;
            tetris.cells.forEach(cell => {
                // console.log(`save to background: ${cell}`);
                if (cell.y >= 0) {
                    this.#current_cellsStyle[cell.y][cell.x] = cell.style;
                } else { game_over = true; }
            });

            if (game_over) {
                console.log(`game over`);
                tetris.banMoves[2] = false;
                this.init();
                return this.#BgDiff(backgroundLog);

            } else {
                this.#subLine();
                this.#exchangeTetromino();

                tetris.banMoves[1] = true;
                tetris.banMoves[3] = true;
                this.#ARROW[0] = 0;
                return this.#BgDiff(backgroundLog);
            }

        }

        if (this.#ARROW[0] > 0 && !tetris.banMoves[1]) {
            tetris.moveBy(1, 0);

        } else if (this.#ARROW[0] < 0 && !tetris.banMoves[3]) {
            tetris.moveBy(-1, 0);

        }

        if (this.#ARROW[1] > 0) {
            tetris.rotate()
            this.#ARROW[1] = 0;
            this.#aabb();
            if (tetris.banMoves[0] || tetris.banMoves[1] || tetris.banMoves[2] || tetris.banMoves[3]) {
                tetris.rotate(true);
            }

        } else if (this.#ARROW[1] < 0) {
            tetris.moveBy(0, 1);

        }

        return this.#BgDiff(backgroundLog);

    }


    /**
     * @param {BackgroundLog} backgroundLog
     * @returns {Array<Array<Cell>>}
     */
    #BgDiff(backgroundLog) {
        let oldBg = new Array(0), newBg = new Array(0), exBg = new Array(0);

        // tetromino diff
        let old_tetris = backgroundLog.log_tetris, cur_tetris = this.#current_tetris.cells;
        for (let i = 0; i < cur_tetris.length; i++) {
            if (old_tetris[i].x != cur_tetris[i].x - 1 || old_tetris[i].y != cur_tetris[i].y || old_tetris[i].style != cur_tetris[i].style) {
                if (old_tetris[i].x == undefined) {
                    newBg.push(new Cell(cur_tetris[i].x - 1, cur_tetris[i].y, cur_tetris[i].style));

                } else if (old_tetris[i].x == cur_tetris[i].x - 1 && old_tetris[i].y == cur_tetris[i].y) {
                    exBg.push(new Cell(cur_tetris[i].x - 1, cur_tetris[i].y, cur_tetris[i].style));

                } else {
                    oldBg.push(new Cell(old_tetris[i].x, old_tetris[i].y, old_tetris[i].style));
                    newBg.push(new Cell(cur_tetris[i].x - 1, cur_tetris[i].y, cur_tetris[i].style));

                }
                old_tetris[i].x = cur_tetris[i].x - 1;
                old_tetris[i].y = cur_tetris[i].y;
                old_tetris[i].style = cur_tetris[i].style;
            }
        }

        // if () {
        //     return [oldBg, newBg, exBg]
        // }

        // background diff
        let log_cellsStyle = backgroundLog.log_cellsStyle, cur_cellsStyle = this.#current_cellsStyle;
        for (let y = log_cellsStyle.length - 1; y >= 0; y--) {
            let cellsStyleSum = 0;
            for (let x = 0; x < log_cellsStyle[y].length; x++) {
                if (log_cellsStyle[y][x] >= 0 || cur_cellsStyle[y][x + 1] >= 0) { cellsStyleSum++; }
                if (log_cellsStyle[y][x] != cur_cellsStyle[y][x + 1]) {
                    if (log_cellsStyle[y][x] != -3 && cur_cellsStyle[y][x + 1] > 0) {
                        exBg.push(new Cell(x, y, cur_cellsStyle[y][x + 1]));
                        log_cellsStyle[y][x] = cur_cellsStyle[y][x + 1];

                    } else if (log_cellsStyle[y][x] != -3) {
                        oldBg.push(new Cell(x, y, -3));
                        log_cellsStyle[y][x] = -3;

                    } else {
                        newBg.push(new Cell(x, y, cur_cellsStyle[y][x + 1]));
                        log_cellsStyle[y][x] = cur_cellsStyle[y][x + 1];

                    }

                }
            }
            if (cellsStyleSum == 0) {
                break;
            }
        }
        return [oldBg, newBg, exBg]

    }

}


class BackgroundLog {

    /** @type {Array<Cell>} */
    log_tetris;

    /** @type {Array<Array<number>>} */
    log_cellsStyle;

    constructor() {
        this.log_cellsStyle = Array.from(
            { length: Background.HEIGHT },
            () => new Array(Background.WIDTH).fill(-3)
        );
        this.log_tetris = Array.from({ length: 4 }, () => new Cell());
    }

    init() {
        for (const cs of this.log_cellsStyle) { cs.fill(-3); }
        for (const cell of this.log_tetris) {
            cell.init(undefined, undefined, undefined);
        }

    }
}

