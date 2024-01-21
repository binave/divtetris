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


class Block {
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
     * @returns {Block}
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

    /** @type {Array<Block>} */
    blocks;

    /** @type {Array<boolean>} [up, right, down, lefft] */
    banMoves;

    constructor() {
        this.blocks = Array.from({ length: 4 }, () => new Block()); // 初始化4个block
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
        this.banMoves = [false, true, false, true]; // up right down lefft

        let non_y1, non_x1, non_y2, non_x2, times = 0;

        do {
            if (++times > 3) { // 当重复次数超过三次生成 I 型
                for (let x = 0; x < this.blocks.length; x++) {
                    this.blocks[x].init(x, 0, style);
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
                    this.blocks[i++].init(x, y, style);
                }
            }
        }

        // let non_row = 0, non_colume = 0, times = 0;
        // let chirality = getRandomInt(2) === 0 ? 0 : 2; // 决定方块朝向
        //
        // do {
        //     if (++times > 2) { // 当重复次数超过三次生成 I 型
        //         for (let colume = 0; colume < this.blocks.length; colume++) {
        //             this.blocks[colume].init(0, colume, style);
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
        //             this.blocks[i++].init(row, colume, style);
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
        this.blocks.forEach(block => {
            block.x += x;
            block.y += y;
        });
    }

    /**
     * 旋转
     * 3 x 3 的矩阵
     * 顺时针旋转 90 度：交换 y 与 x 的坐标并上下翻转。
     * 逆时针旋转 90 度：交换 y 与 x 的坐标并左右翻转。
     * 在交换过程中需要减去与 0,0 的间距，
     * 在 0,0 点交换 y 与 x 会得到与目标图样颠倒的图样，
     * 然后用 2 减去 x 或 y，再将间距加回来。
     * 再移动回原来的位置即可实现旋转。
     *
     * @param counterclockwise {boolean}
     */
    rotate(counterclockwise) {
        // console.log(`rotate: before ${counterclockwise ? 1 : 0} ${this.blocks}`);
        let min_x = this.blocks[0].x, min_y = this.blocks[0].y;
        let line_x = true, line_y = true; // 用于判断直线
        for (let i = 1; i < this.blocks.length; i++) {
            min_x = Math.min(this.blocks[i].x, min_x);
            min_y = Math.min(this.blocks[i].y, min_y);
            line_x = line_x && this.blocks[0].x == this.blocks[i].x;
            line_y = line_y && this.blocks[0].y == this.blocks[i].y;
        }

        if (line_x || line_y) { counterclockwise = false; }

        let empty_line = 0;
        this.blocks.forEach(block => {
            let old_block_x = block.x;
            block.x = (counterclockwise ? block.y - min_y : 2 - (block.y - min_y)) + min_x;
            block.y = (!counterclockwise ? old_block_x - min_x : 2 - (old_block_x - min_x)) + min_y;
            empty_line += counterclockwise ? (min_y != block.y ? 1 : 0) : (min_x != block.x ? 1 : 0);

        });

        if (empty_line == this.blocks.length) { this.moveBy(counterclockwise ? 0 : -1, counterclockwise ? -1 : 0); }
        // console.log(`rotate: after ${counterclockwise ? 1 : 0} ${this.blocks}`);

    }

    toString() {
        return `{blocks:[${this.blocks}], banMoves:[${this.banMoves}]}`
    }


}


/**
 *    |-- width: 4 --|
 * 0,0                 5,0 _
 * 0,1                 5,1 |
 * 0,2       O         5,2 |
 * 0,3   O O O         5,3 | height: 8
 * 0,4                 5,4 |
 * 0,5                 5,5 |
 * 0,6                 5,6 |
 * 0,7                 5,7 -
 * 0,8 1,8 2,8 3,8 4,8 5,8
 */

export class Background {

    static WIDTH = 10; static HEIGHT = 20;

    static #BG_WIDTH_OFFSET = 1;

    static #BG_AUTO_DROP_CYCLE = 11;
    // static #BG_AUTO_DROP_CYCLE = 3;

    /** @type {number} */
    #autoDropSum = 0;

    /** @type {Generator<number, void, unknown>} 随机不重复数字 */
    #loopRan;

    /**
     * #KEY_BOARD_CODES = [-x+, -y+, exchangeTetromino, pause/game_over]; // 按键按下状态。
     * #KEY_BOARD_CODE_HOLDS = [0...]; // 每步累计的按键累加值。
     */
    #KEY_BOARD_CODES = [0, 0, 0, 0, 0];
    #KEY_BOARD_CODE_HOLDS = Array.from({ length: this.#KEY_BOARD_CODES.length }, () => 0);

    #sP = 0;
    #line = 0;

    /** @type {Array<Tetromino>} */
    #dual_tetromino;

    /** @type {number} */
    #tetIdx = 0;

    /** @type {Array<Array<number>>} */
    #current_blocksStyle;

    /** @param {GlobalEventHandlers} element */
    constructor(element) {
        this.#loopRan = Shuffle(4);
        this.#dual_tetromino = [new Tetromino(), new Tetromino()];
        this.#dual_tetromino[0].init(this.#loopRan.next().value);
        this.#dual_tetromino[1].init(this.#loopRan.next().value);

        let blocksStyle = new Array();
        for (let y = 0; y < Background.HEIGHT + Background.#BG_WIDTH_OFFSET; y++) {
            blocksStyle[y] = new Array();
            if (y == Background.HEIGHT + Background.#BG_WIDTH_OFFSET - 1) {
                for (let x = 0; x <= Background.WIDTH + Background.#BG_WIDTH_OFFSET; x++) { blocksStyle[y][x] = -1; }

            } else {
                for (const x of [0, Background.WIDTH + Background.#BG_WIDTH_OFFSET]) { blocksStyle[y][x] = -1; }
                for (let x = 1; x <= Background.WIDTH; x++) { blocksStyle[y][x] = -3; }

            }
        }
        this.#current_blocksStyle = blocksStyle;

        element.addEventListener("keyup", (event) => this.#keyUpDown(event, true, this.#KEY_BOARD_CODES), true);
        element.addEventListener("keydown", (event) => this.#keyUpDown(event, false, this.#KEY_BOARD_CODES), true);

        this.#dual_tetromino[this.#tetIdx].moveBy(5, -1);
    }

    /**
     * @param {KeyboardEvent} event
     * @param {boolean} isKeyUp
     * @param {Array<number>} arrow
     */
    #keyUpDown(event, isKeyUp, arrow) {
        // console.log(`PRESS: <${event.code}> ${isKeyUp ? 'up' : 'down'}`);
        switch (event.code) {
            case "ArrowLeft": arrow[0] = isKeyUp ? 0 : -1; break;
            case "ArrowRight": arrow[0] = isKeyUp ? 0 : 1; break;
            case "ArrowUp": arrow[1] = isKeyUp ? 0 : 1; break;
            case "ArrowDown": arrow[1] = isKeyUp ? 0 : -1; break;
            case "ShiftLeft": case "ShiftRight": arrow[2] = isKeyUp ? 0 : 1; break;
            case "Space": case "KeyP": if (!isKeyUp) { arrow[3] = arrow[3] == 0 ? 1 : 0; } break;
            default: break;
        }

    }

    init() {
        this.#exchangeTetromino();
        this.#autoDropSum = 0;
        this.#sP = 0;
        this.sub_sum = 0;
        for (let y = 0; y < Background.HEIGHT; y++) {
            for (let x = 1; x <= Background.WIDTH; x++) {
                this.#current_blocksStyle[y][x] = -3;
            }
        }
    }

    #exchangeTetromino() {
        // console.log(`exchange`);
        this.#dual_tetromino[this.#tetIdx].init(this.#loopRan.next().value);
        this.#tetIdx = 1 - this.#tetIdx;
        this.#dual_tetromino[this.#tetIdx].moveBy(5, -1);

    }

    /**
     *
     */
    #borderAABB() {
        const tetris = this.#dual_tetromino[this.#tetIdx], cur_style = this.#current_blocksStyle;
        tetris.banMoves.fill(false);
        for (const block of tetris.blocks) {
            if (block.y < 0) {
                tetris.banMoves[1] = true;
                tetris.banMoves[3] = true;
            }

            tetris.banMoves = [
                tetris.banMoves[0] /*|| (cur_style[block.y - 1] == undefined ||
                    cur_style[block.y - 1][block.x] > -2) */,
                tetris.banMoves[1] || (cur_style[block.y] == undefined ||
                    cur_style[block.y][block.x + 1] > -2),
                tetris.banMoves[2] || (cur_style[block.y + 1] == undefined ||
                    cur_style[block.y + 1][block.x] > -2),
                tetris.banMoves[3] || (cur_style[block.y] == undefined ||
                    cur_style[block.y][block.x - 1] > -2)
            ]

        }
    }

    /**
     * @returns {boolean} hit
     */
    #overAABB() {
        for (const block of this.#dual_tetromino[this.#tetIdx].blocks) {
            if (this.#current_blocksStyle[block.y] == undefined ||
                this.#current_blocksStyle[block.y][block.x] > -2) {
                return true;
            }
        }
        return false;
    }

    #subLine() {
        let sub_sum = 0;
        for (let y = Background.HEIGHT - Background.#BG_WIDTH_OFFSET; y >= 0; y--) {
            let block_sum = 0;
            for (let x = 1; x <= Background.WIDTH; x++) {
                if (this.#current_blocksStyle[y][x] >= 0) { block_sum++; }
            }
            if (block_sum == Background.WIDTH) {
                sub_sum++;
                let styleArr = this.#current_blocksStyle[y];
                styleArr.fill(-3);
                styleArr[0] = -1;
                styleArr[styleArr.length - 1] = -1;
                this.#current_blocksStyle.splice(y++, 1);
                this.#current_blocksStyle.unshift(styleArr);

            }

            if (block_sum == 0) { break; }

        }

        switch (sub_sum) {
            case 1: break;
            case 2: this.#sP += 1; break;
            case 3: this.#sP += 3; break;
            case 4: this.#sP += 6; break;
            default: break;
        }
        this.#sP = Math.min(this.#sP, 30);
        this.#line += sub_sum;

    }

    #hitBottom() {
        let game_over = false;
        const tetris = this.#dual_tetromino[this.#tetIdx];
        // console.log(`save to background: ${tetris.blocks}`);
        tetris.blocks.forEach(block => {
            if (block.y >= 0) {
                this.#current_blocksStyle[block.y][block.x] = block.style;

            } else { game_over = true; }
        });

        if (game_over) {
            console.log(`game over`);
            // TODO
            this.init();
            tetris.banMoves[2] = false;
            this.#KEY_BOARD_CODES[3] = 1;

        } else {
            this.#subLine();
            this.#exchangeTetromino();
            tetris.banMoves[1] = true;
            tetris.banMoves[3] = true;

        }

    }

    /**
     * @param {BackgroundLog} backgroundLog
     * @returns {Array<Array<number>>}
     */
    run1Step(backgroundLog) {
        if (this.#KEY_BOARD_CODES[3] == 1) { /* TODO console.log(`pause`); */ return [[], [], [], 1]; }

        for (const i in this.#KEY_BOARD_CODES) {
            this.#KEY_BOARD_CODES[i] == 0 ? this.#KEY_BOARD_CODE_HOLDS[i] = 0 : this.#KEY_BOARD_CODE_HOLDS[i] += this.#KEY_BOARD_CODES[i];
        }

        // console.log(`KEY_BOARD_CODES:${this.#KEY_BOARD_CODES}, KEY_BOARD_CODE_HOLDS:${this.#KEY_BOARD_CODE_HOLDS}`);
        const tetris = this.#dual_tetromino[this.#tetIdx];

        if (this.#KEY_BOARD_CODES[0] > 0 && this.#KEY_BOARD_CODE_HOLDS[0] != 2) {
            this.#borderAABB();
            if (!tetris.banMoves[1]) { tetris.moveBy(1, 0); }

        } else if (this.#KEY_BOARD_CODES[0] < 0 && this.#KEY_BOARD_CODE_HOLDS[0] != -2) {
            this.#borderAABB();
            if (!tetris.banMoves[3]) { tetris.moveBy(-1, 0); }

        }

        if (this.#KEY_BOARD_CODE_HOLDS[2] == 1) {
            if (this.#sP > 0) {
                this.#sP --;
                this.#exchangeTetromino();
            }
        }

        if (this.#KEY_BOARD_CODES[1] > 0) {
            if (this.#KEY_BOARD_CODE_HOLDS[1] == 1) {
                tetris.rotate()
                if (this.#overAABB()) {
                    // tetris.rotate(); tetris.rotate(); tetris.rotate();
                    tetris.rotate(true);
                }

            }

        } else if (this.#KEY_BOARD_CODES[1] < 0) {
            for (let y = 0; y < this.#KEY_BOARD_CODE_HOLDS[1] * -1 / 2; y++) {
                this.#borderAABB();
                if (tetris.banMoves[2]) { this.#KEY_BOARD_CODE_HOLDS[1] = 0; this.#hitBottom(); } else { tetris.moveBy(0, 1); }
            }

        }

        if (this.#autoDropSum++ >= Background.#BG_AUTO_DROP_CYCLE) {
            this.#autoDropSum = 0;
            if (this.#KEY_BOARD_CODES[1] >= 0) {
                this.#borderAABB();
                if (tetris.banMoves[2]) { this.#hitBottom(); } else { tetris.moveBy(0, 1); }
            }
        }

        return this.#BgDiff(backgroundLog);

    }


    /**
     * @param {BackgroundLog} backgroundLog
     * @returns {Array<Array<number>>}
     */
    #BgDiff(backgroundLog) {
        let oldBg = new Array(0), newBg = new Array(0), exBg = new Array(0), oldMap = new Map();

        // tetromino diff
        let old_ready_tetris = backgroundLog.log_dual_tetris[1], cur_ready_tetris = this.#dual_tetromino[1 - this.#tetIdx].blocks;
        let old_tetris = backgroundLog.log_dual_tetris[0], cur_tetris = this.#dual_tetromino[this.#tetIdx].blocks;
        for (let i = 0; i < cur_tetris.length; i++) {
            // auto down
            if (old_tetris[i].x != cur_tetris[i].x - 1 || old_tetris[i].y != cur_tetris[i].y || old_tetris[i].style != cur_tetris[i].style) {
                if (old_tetris[i].x == undefined) {
                    newBg.push(cur_tetris[i].x - 1, cur_tetris[i].y, cur_tetris[i].style);

                } else if (old_tetris[i].x == cur_tetris[i].x - 1 && old_tetris[i].y == cur_tetris[i].y) {
                    exBg.push(cur_tetris[i].x - 1, cur_tetris[i].y, cur_tetris[i].style);

                } else {
                    oldBg.push(old_tetris[i].x, old_tetris[i].y, old_tetris[i].style);
                    oldMap.set(`${old_tetris[i].x},${old_tetris[i].y}`, 1);
                    newBg.push(cur_tetris[i].x - 1, cur_tetris[i].y, cur_tetris[i].style);

                }
                old_tetris[i].init(cur_tetris[i].x - 1, cur_tetris[i].y, cur_tetris[i].style);
            }

            // ready
            if (old_ready_tetris[i].x != cur_ready_tetris[i].x + Background.WIDTH + 3 || old_ready_tetris[i].y != cur_ready_tetris[i].y + 2 || old_ready_tetris[i].style != cur_ready_tetris[i].style) {
                if (old_ready_tetris[i].x == undefined) {
                    newBg.push(cur_ready_tetris[i].x + Background.WIDTH + 3, cur_ready_tetris[i].y + 2, cur_ready_tetris[i].style);

                } else if (old_ready_tetris[i].x == cur_ready_tetris[i].x + Background.WIDTH + 3 && old_ready_tetris[i].y == cur_ready_tetris[i].y + 2) {
                    exBg.push(cur_ready_tetris[i].x + Background.WIDTH + 3, cur_ready_tetris[i].y + 2, cur_ready_tetris[i].style);

                } else {
                    oldBg.push(old_ready_tetris[i].x, old_ready_tetris[i].y, old_ready_tetris[i].style);
                    oldMap.set(`${old_ready_tetris[i].x},${old_ready_tetris[i].y}`, 1);
                    newBg.push(cur_ready_tetris[i].x + Background.WIDTH + 3, cur_ready_tetris[i].y + 2, cur_ready_tetris[i].style);

                }
                old_ready_tetris[i].init(cur_ready_tetris[i].x + Background.WIDTH + 3, cur_ready_tetris[i].y + 2, cur_ready_tetris[i].style);
            }

        }

        // background diff
        let log_blocksStyle = backgroundLog.log_blocksStyle, cur_blocksStyle = this.#current_blocksStyle;
        for (let y = log_blocksStyle.length - 1; y >= 0; y--) {
            let blocksStyleSum = 0;
            for (let x = 0; x < log_blocksStyle[y].length; x++) {
                if (log_blocksStyle[y][x] >= 0 || cur_blocksStyle[y][x + 1] >= 0) { blocksStyleSum++; }
                if (log_blocksStyle[y][x] != cur_blocksStyle[y][x + 1]) {
                    if (log_blocksStyle[y][x] != -3 && cur_blocksStyle[y][x + 1] > 0) {
                        exBg.push(x, y, cur_blocksStyle[y][x + 1]);
                        log_blocksStyle[y][x] = cur_blocksStyle[y][x + 1];

                    } else if (log_blocksStyle[y][x] != -3) {
                        oldBg.push(x, y, -3);
                        oldMap.set(`${x},${y}`, 1);
                        log_blocksStyle[y][x] = -3;

                    } else {
                        newBg.push(x, y, cur_blocksStyle[y][x + 1]);
                        log_blocksStyle[y][x] = cur_blocksStyle[y][x + 1];

                    }

                }
            }
            if (blocksStyleSum == 0) {
                break;
            }
        }

        let ni = 0;
        while (newBg[ni] != undefined) {
            ni += 3;
            if (oldMap.has(`${newBg[ni]},${newBg[ni + 1]}`)) {
                oldMap.delete(`${newBg[ni]},${newBg[ni + 1]}`);
                let oi = 0;
                for (; oi < oldBg.length; oi += 3) { if (oldBg[oi] == newBg[ni] && oldBg[oi + 1] == newBg[ni + 1]) { break; } }
                if (oldBg[oi + 2] != newBg[ni + 2]) { exBg.push(newBg[ni], newBg[ni + 1], newBg[ni + 2]); }
                oldBg.splice(oi, 3);
                newBg.splice(ni, 3);
            }
        }

        return [oldBg, newBg, exBg, 0]

    }

}


export class BackgroundLog {

    /** @type {Array<Array<Block>>} */
    log_dual_tetris;

    /** @type {Array<Array<number>>} */
    log_blocksStyle;

    constructor() {
        this.log_blocksStyle = Array.from(
            { length: Background.HEIGHT },
            () => new Array(Background.WIDTH).fill(-3)
        );
        // this.log_dual_tetris = Array.from({ length: 2 }, () => new Array(4).fill(new Block())); // bug: Array().fill(): same obj
        this.log_dual_tetris = Array.from({ length: 2 }, () => Array.from({ length: 4 }, () => new Block()));

    }

    init() {
        for (const cs of this.log_blocksStyle) { cs.fill(-3); }
        for (const tetris of this.log_dual_tetris) {
            for (const block of tetris) {
                block.init(undefined, undefined, undefined);
            }
        }
    }
}

