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
    /** @type {number} */ x;
    /** @type {number} */ y;
    /** @type {number} */ style;

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

    /** @type {Array<Block>} */ blocks;
    /** @type {Array<boolean>} [up, right, down, lefft] */ banMoves;

    constructor() {
        this.blocks = Array.from({ length: 4 }, () => new Block()); // 初始化4个block
    }

    /**
     * 随机 6 种形状和若干颜色。并指定生成 I 型。
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
     * @param {boolean} isLine
     */
    init(style, isLine) {
        this.banMoves = [false, true, false, true]; // up right down lefft

        if (isLine) {
            for (let x = 0; x < this.blocks.length; x++) {
                this.blocks[x].init(x, 0, style);
            }
            return;
        }

        /** @type {Array<number>} [ 0:x1, 1:y1, 2:x2, 3:y2 ] */
        let non;

        do {
            non = [getRandomInt(3), getRandomInt(2), getRandomInt(3), getRandomInt(2)];

        } while (
            (non[0] == non[2] && non[1] == non[3]) ||
            (non[1] != non[3] && (
                Math.abs(non[0] - non[2]) == 1 ||
                (non[0] == non[2] && non[0] != 2)
            ))
        )

        let i = 0;
        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 2; y++) {
                if (!((x === non[0] && y === non[1]) || (x === non[2] && y === non[3]))) {
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
    static #BG_AUTO_DROP_CYCLE = 11; #autoDropSum = 0;

    static WALL = -1; static EMPTY = -3;

    /**
     * KEY_BOARD_CODES = [-x+, -y+, exchangeTetromino, pause/game_over]; // 按键按下状态。
     * #KEY_BOARD_CODE_HOLDS = [0...]; // 每步累计的按键累加值。
     */
    #KEY_BOARD_CODE_HOLDS = Array.from({ length: 5 }, () => 0);

    /** 1: pause, 2: gameover */
    #gameStatus = 0; #sP = 0; #line = 0;

    #generateTetrisLine = false;

    /** @type {Generator<number, void, unknown>} 随机不重复数字 */ #loopRan;
    /** @type {Array<Tetromino>} */ #dual_tetromino;
    /** @type {number} */ #tetIdx = 0;
    /** @type {Array<Array<number>>} */ #current_blocksStyle;
    /** @type {Snapshot} */ #snapshot;

    constructor() {
        this.#loopRan = Shuffle(4);
        this.#dual_tetromino = [new Tetromino(), new Tetromino()];
        this.#dual_tetromino[0].init(this.#loopRan.next().value, false);
        this.#dual_tetromino[1].init(this.#loopRan.next().value, false);

        const blocksStyle = new Array();
        for (let y = 0; y < Background.HEIGHT + Background.#BG_WIDTH_OFFSET; y++) {
            blocksStyle[y] = new Array();
            if (y == Background.HEIGHT + Background.#BG_WIDTH_OFFSET - 1) {
                for (let x = 0; x <= Background.WIDTH + Background.#BG_WIDTH_OFFSET; x++) { blocksStyle[y][x] = Background.WALL; }

            } else {
                for (const x of [0, Background.WIDTH + Background.#BG_WIDTH_OFFSET]) { blocksStyle[y][x] = Background.WALL; }
                for (let x = 1; x <= Background.WIDTH; x++) { blocksStyle[y][x] = Background.EMPTY; }

            }
        }
        this.#current_blocksStyle = blocksStyle;

        this.#dual_tetromino[this.#tetIdx].moveBy(5, -1);
        this.#snapshot = new Snapshot();

    }



    init() {
        this.#exchangeTetromino();
        this.#autoDropSum = 0;
        this.#sP = 0;
        this.#line = 0;
        this.#gameStatus = 0;
        this.#snapshot.init();
        for (let y = 0; y < Background.HEIGHT; y++) {
            for (let x = 1; x <= Background.WIDTH; x++) {
                this.#current_blocksStyle[y][x] = Background.EMPTY;
            }
        }
    }

    #exchangeTetromino() {
        // console.log(`exchange`);
        this.#dual_tetromino[this.#tetIdx].init(this.#loopRan.next().value, this.#generateTetrisLine);
        this.#generateTetrisLine = false;
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
        let y = Background.HEIGHT - Background.#BG_WIDTH_OFFSET;
        for (; y >= 0; y--) {
            let block_sum = 0;
            for (let x = 1; x <= Background.WIDTH; x++) {
                if (this.#current_blocksStyle[y][x] >= 0) { block_sum++; }
            }
            if (block_sum == Background.WIDTH) {
                sub_sum++;
                // let styleArr = this.#current_blocksStyle[y];
                let [styleArr] = this.#current_blocksStyle.splice(y++, 1);
                styleArr.fill(Background.EMPTY);
                styleArr[0] = Background.WALL;
                styleArr[styleArr.length - 1] = Background.WALL;
                this.#current_blocksStyle.unshift(styleArr);

            }

            if (block_sum == 0) { break; }

        }

        if (y <= Background.HEIGHT - 5 && !this.#generateTetrisLine) {
            const bs = this.#current_blocksStyle;
            for (let x = 0; x < Background.WIDTH; x++) {
                for (let _y = y + 1; _y < Background.HEIGHT - 2; _y++) {
                    if (bs[_y][x + 1] != Background.EMPTY) { break; }
                    if (
                        bs[_y + 0][x] != Background.EMPTY && bs[_y + 0][x + 1] == Background.EMPTY && bs[_y + 0][x + 2] != Background.EMPTY &&
                        bs[_y + 1][x] != Background.EMPTY && bs[_y + 1][x + 1] == Background.EMPTY && bs[_y + 1][x + 2] != Background.EMPTY &&
                        bs[_y + 2][x] != Background.EMPTY && bs[_y + 2][x + 1] == Background.EMPTY && bs[_y + 2][x + 2] != Background.EMPTY
                    ) {
                        // console.log(`find: x,y:${x + 1},${_y}-${_y + 2}`);
                        this.#generateTetrisLine = getRandomInt(3) == 0;
                        break;
                    }

                }
                if (this.#generateTetrisLine) { break; }
            }
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
        const tetris = this.#dual_tetromino[this.#tetIdx];
        // console.log(`save to background: ${tetris.blocks}`);
        tetris.blocks.forEach(block => {
            if (block.y >= 0) {
                this.#current_blocksStyle[block.y][block.x] = block.style;

            } else { this.#gameStatus = 2; console.log(`game over`); }
        });

        if (this.#gameStatus != 2) {
            this.#subLine();
            this.#exchangeTetromino();
            tetris.banMoves[1] = true;
            tetris.banMoves[3] = true;

        }

    }

    /**
     * @param {Array<number>} key_board_codes
     * @returns {Array<Array<number>>}
     */
    run1Step(key_board_codes) {
        if (key_board_codes[3] == 1) {
             /* console.log(`pause`); */ return [[], [], [], [], [this.#gameStatus == 2 ? 2 : 1, this.#sP, this.#line]];

        } else if (this.#gameStatus == 2) {
            this.#gameStatus = 0;
            this.init();
            this.#dual_tetromino[this.#tetIdx].banMoves[2] = false;
            return [[], [], [], [], [3, this.#sP, this.#line]];

        }

        for (const i in key_board_codes) {
            key_board_codes[i] == 0 ? this.#KEY_BOARD_CODE_HOLDS[i] = 0 : this.#KEY_BOARD_CODE_HOLDS[i] += key_board_codes[i];
        }

        // console.log(`key_board_codes:${key_board_codes}, KEY_BOARD_CODE_HOLDS:${this.#KEY_BOARD_CODE_HOLDS}`);
        const tetris = this.#dual_tetromino[this.#tetIdx];

        if (key_board_codes[0] > 0 && this.#KEY_BOARD_CODE_HOLDS[0] != 2) {
            this.#borderAABB();
            if (!tetris.banMoves[1]) { tetris.moveBy(1, 0); }

        } else if (key_board_codes[0] < 0 && this.#KEY_BOARD_CODE_HOLDS[0] != -2) {
            this.#borderAABB();
            if (!tetris.banMoves[3]) { tetris.moveBy(-1, 0); }

        }

        if (this.#KEY_BOARD_CODE_HOLDS[2] == 1) {
            if (this.#sP > 0) {
                this.#sP --;
                this.#exchangeTetromino();
            }
        }

        if (key_board_codes[1] > 0) {
            if (this.#KEY_BOARD_CODE_HOLDS[1] == 1) {
                tetris.rotate()
                if (this.#overAABB()) {
                    // tetris.rotate(); tetris.rotate(); tetris.rotate();
                    tetris.rotate(true);
                }

            }

        } else if (key_board_codes[1] < 0) {
            for (let y = 0; y < this.#KEY_BOARD_CODE_HOLDS[1] * -1 / 2; y++) {
                this.#borderAABB();
                if (tetris.banMoves[2]) { this.#KEY_BOARD_CODE_HOLDS[1] = 2; this.#hitBottom(); } else { tetris.moveBy(0, 1); }
            }

        }

        if (this.#autoDropSum++ >= Background.#BG_AUTO_DROP_CYCLE) {
            this.#autoDropSum = 0;
            if (key_board_codes[1] >= 0) {
                this.#borderAABB();
                if (tetris.banMoves[2]) { this.#hitBottom(); } else { tetris.moveBy(0, 1); }
            }
        }

        return this.#BgDiff();

    }


    /**
     * @returns {Array<Array<number>>}
     */
    #BgDiff() {
        const oldBg = new Array(0), newBg = new Array(0), exBg = new Array(0), oldMap = new Map();

        // tetromino diff
        const old_tetris = this.#snapshot.log_dual_tetris[0], cur_tetris = this.#dual_tetromino[this.#tetIdx].blocks;
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

        }

        // background diff
        const log_blocksStyle = this.#snapshot.log_blocksStyle, cur_blocksStyle = this.#current_blocksStyle;
        for (let y = log_blocksStyle.length - 1; y >= 0; y--) {
            let blocksStyleSum = 0;
            for (let x = 0; x < log_blocksStyle[y].length; x++) {
                if (log_blocksStyle[y][x] >= 0 || cur_blocksStyle[y][x + 1] >= 0) { blocksStyleSum++; }
                if (log_blocksStyle[y][x] != cur_blocksStyle[y][x + 1]) {
                    if (log_blocksStyle[y][x] != Background.EMPTY && cur_blocksStyle[y][x + 1] > 0) {
                        exBg.push(x, y, cur_blocksStyle[y][x + 1]);
                        log_blocksStyle[y][x] = cur_blocksStyle[y][x + 1];

                    } else if (log_blocksStyle[y][x] != Background.EMPTY) {
                        oldBg.push(x, y, Background.EMPTY);
                        oldMap.set(`${x},${y}`, 1);
                        log_blocksStyle[y][x] = Background.EMPTY;

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

        // trim block
        let ni = 0;
        while (newBg[ni] != undefined) {
            if (oldMap.has(`${newBg[ni]},${newBg[ni + 1]}`)) {
                oldMap.delete(`${newBg[ni]},${newBg[ni + 1]}`);
                let oi = 0;
                for (; oi < oldBg.length; oi += 3) { if (oldBg[oi] == newBg[ni] && oldBg[oi + 1] == newBg[ni + 1]) { break; } }
                if (oldBg[oi + 2] != newBg[ni + 2]) { exBg.push(newBg[ni], newBg[ni + 1], newBg[ni + 2]); }
                oldBg.splice(oi, 3);
                newBg.splice(ni, 3);
            }
            ni += 3;

        }

        // ready tetromino
        const ready = new Array(0), old_ready_tetris = this.#snapshot.log_dual_tetris[1], cur_ready_tetris = this.#dual_tetromino[1 - this.#tetIdx].blocks;
        for (let i = 0; i < cur_ready_tetris.length; i++) {
            if (old_ready_tetris[i].x != cur_ready_tetris[i].x || old_ready_tetris[i].y != cur_ready_tetris[i].y || old_ready_tetris[i].style != cur_ready_tetris[i].style) {
                ready.push(cur_ready_tetris[i].x, cur_ready_tetris[i].y, cur_ready_tetris[i].style);
                old_ready_tetris[i].init(cur_ready_tetris[i].x, cur_ready_tetris[i].y, cur_ready_tetris[i].style);
            }
        }

        return [oldBg, newBg, exBg, ready, [0, this.#sP, this.#line]];

    }


}


class Snapshot {
    /** @type {Array<Array<Block>>} */ log_dual_tetris;
    /** @type {Array<Array<number>>} */ log_blocksStyle;

    constructor() {
        this.log_blocksStyle = Array.from(
            { length: Background.HEIGHT },
            () => new Array(Background.WIDTH).fill(Background.EMPTY)
        );
        // this.log_dual_tetris = Array.from({ length: 2 }, () => new Array(4).fill(new Block())); // bug: Array().fill(): same obj
        this.log_dual_tetris = Array.from({ length: 2 }, () => Array.from({ length: 4 }, () => new Block()));

    }

    init() {
        for (const cs of this.log_blocksStyle) { cs.fill(Background.EMPTY); }
        for (const tetris of this.log_dual_tetris) {
            for (const block of tetris) {
                block.init(undefined, undefined, undefined);
            }
        }
    }
}
