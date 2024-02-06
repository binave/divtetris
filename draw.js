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

'use strict';

class RGB {
    /** @type {number} */ r;
    /** @type {number} */ g;
    /** @type {number} */ b;
    /** @type {number} */ a;

    /**
     * @param {number} r
     * @param {number} g
     * @param {number} b
     * @param {number} a
     */
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    toString() {
        return this.a == undefined ?
            `rgb(${this.r}, ${this.g}, ${this.b})` :
            `rgb(${this.r}, ${this.g}, ${this.b}, ${this.a})`
    }

};


class displayLaunchOptions {
    /** @type {HTMLElement} */ styleElement;
    /** @type {HTMLElement} */ bodyElement;
    /** @type {Array<*>} */ divElements;
    /** @type {Array<RGB>} */ tetrominoColors;
    /** @type {RGB} */ bodyBgColor;
    /** @type {RGB} */ bgBorderColor;
}

class Display {
    /** @type {displayLaunchOptions} */ #options;
    /** @type {Map<string,HTMLElement>} */ #parentDivs;
    #show_hold = true;
    #show_score = 0;

    /**
     * @param {displayLaunchOptions} options
     */
    constructor(options) {
        this.#options = options;
        this.#options.styleElement.innerHTML += `body { background-color: ${this.#options.bodyBgColor}; }
`;

        for (const any of this.#options.divElements) {

            if (any.dt != undefined) {
                this.#options.styleElement.innerHTML += `#${any.id} {
    position: absolute;
    background-color: rgb(0, 0, 0, 0);
    width: ${any.bg}px;
    height: ${any.bg}px;
    top: ${any.top}px;
    left: ${any.left}px;
    border: 3px solid rgb(0, 0, 0, 0);
    border-${any.dt[0]}-color: ${this.#options.bgBorderColor};
    border-${any.dt[1]}-color: ${this.#options.bgBorderColor};
    z-index: -1;
}
`
            } else if (any.bg != undefined) {
                this.#options.styleElement.innerHTML += `#${any.id} {
    position: absolute;
    background-color: ${this.#options.bodyBgColor};
    width: ${any.bg}px;
    height: ${any.bg}px;
    top: ${any.top}px;
    left: ${any.left}px;
    z-index: -1;
}
`
            } else if (any.color != undefined) {
                this.#options.styleElement.innerHTML += `#${any.id} {
    position: absolute;
    color: ${any.color};
    font-size: ${any.font_size}px;
    top: ${any.top}px;
    left: ${any.left}px;
}
`
            } else if (any.top != undefined) {
                this.#options.styleElement.innerHTML += `#${any.id} {
    position: absolute;
    top: ${any.top}px;
    left: ${any.left}px;
}
#${any.id} div {
    position: absolute;
    /* transition: transform 0.5s; */
}

`
            }
        }

        let i = 0;
        for (const rgb of this.#options.tetrominoColors) {
            this.#options.styleElement.innerHTML += this.#colorStyle(`c${i++}`, rgb, 20, 20, 5);
            this.#options.styleElement.innerHTML += this.#colorStyle(`r${i - 1}`, rgb, 10, 10, 2);

        }

        this.#parentDivs = new Map();
        for (const any of this.#options.divElements) {
            const newDiv = document.createElement("div");
            newDiv.setAttribute('id', any.id);
            if (any.classname != undefined) { newDiv.setAttribute('class', any.classname); }
            this.#options.bodyElement.appendChild(newDiv);
            this.#parentDivs.set(any.id.replace(/[0-9]+$/, ''), newDiv);
            // this.#options.bodyElement.innerHTML += `    <div id="${border.id}"></div>`; // bug: lost geTelementById cache before
        }
        this.#parentDivs.get('score').innerText = `score: 0`;

    }

    /**
     * @param {string} name
     * @param {RGB} rgb
     * @param {number} width
     * @param {number} height
     * @param {number} border
     * @returns {string}
     */
    #colorStyle(name, rgb, width, height, border) {
        let light_rgb = this.#RGB_bloom(rgb), dark_rgb = this.#RGB_bloom(rgb, true);
        return `.${name} {
    width: ${width}px; height: ${height}px;
    background-color: ${rgb};
    border: ${border}px solid ${light_rgb};
    border-bottom-color: ${dark_rgb};
    border-left-color: ${dark_rgb};
}
`;
    }


    /**
     * @param {RGB} rgb
     * @param {boolean} dark
     * @returns {RGB}
     */
    #RGB_bloom(rgb, dark) { return new RGB(this.#bloom(rgb.r, dark), this.#bloom(rgb.g, dark), this.#bloom(rgb.b, dark), rgb.a); }

    /**
     * @param {number} cn
     * @param {boolean} dark
     * @returns {number}
     */
    #bloom(cn, dark) { return dark ? (cn - 128 < 0 ? 0 : cn - 128) : (cn + 128 > 255 ? 255 : cn + 128); }

    /**
     * @param {Array<number>} oldBg
     * @param {Array<number>} newBg
     * @param {Array<number>} exBg
     * @param {Array<number>} ready
     * @param {Array<number>} status
     */
    modifyStyle(oldBg, newBg, exBg, ready, status) {
        if (this.#show_score != status[2]) { this.#show_score = status[2]; this.#parentDivs.get('score').innerText = `score: ${this.#show_score}`; }

        if (status[0] == 0) {
            // console.log(`oldBg:size=${oldBg.length} ${oldBg},\nnewBg:size=${newBg.length} ${newBg},\n exBg:size=${exBg.length} ${exBg},\n ready:size=${ready.length} ${ready}`)
            if (this.#show_hold) { this.#show_hold = false; this.#parentDivs.get('hold').style.display = 'none'; }

            for (let i = 0; i < exBg.length; i += 3) {
                document.getElementById(`m${exBg[i]},${exBg[i + 1]}`).className = exBg[i + 1] >= 0 ? `c${exBg[i + 2]}` : '';
            }

            let i = 0, diff_size = newBg.length - oldBg.length;
            for (; i < (diff_size > 0 ? oldBg.length : newBg.length); i += 3) {
                let x = newBg[i], y = newBg[i + 1], oldDiv = document.getElementById(`m${oldBg[i]},${oldBg[i + 1]}`);
                // oldDiv.style.left = `${x * 30}px`;
                // oldDiv.style.top = `${y * 30}px`;
                oldDiv.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
                oldDiv.className = y >= 0 ? `c${newBg[i + 2]}` : '';
                oldDiv.id = `m${x},${y}`;
            }

            if (diff_size > 0) {
                for (; i < newBg.length; i += 3) {
                    let x = newBg[i], y = newBg[i + 1], newDiv = document.createElement("div");
                    newDiv.id = `m${x},${y}`;
                    // newDiv.style.left = `${x * 30}px`
                    // newDiv.style.top = `${y * 30}px`;
                    newDiv.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
                    newDiv.className = y >= 0 ? `c${newBg[i + 2]}` : '';
                    this.#parentDivs.get('main').appendChild(newDiv);

                }

            } else {
                for (; i < oldBg.length; i += 3) { document.getElementById(`m${oldBg[i]},${oldBg[i + 1]}`).remove(); }

            }

            // ready
            let readyDivs = Array.from(this.#parentDivs.get('ready').getElementsByTagName(`div`));
            if (readyDivs.length == 0) {
                for (let i = 0; i < ready.length; i += 3) {
                    let newDiv = document.createElement("div");
                    // newDiv.style.left = `${ready[i] * 14}px`
                    // newDiv.style.top = `${ready[i + 1] * 14}px`;
                    newDiv.style.transform = `translate(${ready[i] * 14}px, ${ready[i + 1] * 14}px)`;
                    newDiv.className = `r${ready[i + 2]}`;
                    this.#parentDivs.get('ready').appendChild(newDiv);
                }

            } else {
                for (let i = 0; i < ready.length; i += 3) {
                    // readyDivs[i / 3].style.left = `${ready[i] * 14}px`
                    // readyDivs[i / 3].style.top = `${ready[i + 1] * 14}px`;
                    readyDivs[i / 3].style.transform = `translate(${ready[i] * 14}px, ${ready[i + 1] * 14}px)`;
                    readyDivs[i / 3].className = `r${ready[i + 2]}`
                }

            }


        } else if ((status[0] == 1 || status[0] == 2) && !this.#show_hold) {
            this.#show_hold = true;
            this.#parentDivs.get('hold').style.display = 'block';
            this.#parentDivs.get('hold').innerText = status[0] == 1 ? 'push' : 'Game Over';

        } else if (status[0] == 3) {
            for (const div of Array.from(this.#parentDivs.get('main').getElementsByTagName(`div`))) { div.remove(); }

        }
    }

}

