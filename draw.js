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

const body_bg_color = new RGB(40, 40, 40);
const bg_border_color = new RGB(88, 88, 88);

const bg_border_styles = [
    { id: `leftTop1`, top: 97, left: 96, bg: 50, dt: [`left`, `top`] },
    { id: `rightTop1`, top: 97, left: 348, bg: 50, dt: [`right`, `top`] },
    { id: `leftBottom1`, top: 648, left: 96, bg: 50, dt: [`left`, `bottom`] },
    { id: `rightBottom1`, top: 648, left: 348, bg: 50, dt: [`right`, `bottom`] }
];

const bg_border_hid_styles = [
    { id: `leftTopHid1`, top: 97, left: 96, bg: 10 },
    { id: `rightTopHid1`, top: 97, left: 394, bg: 10 },
    { id: `leftBottomHid1`, top: 694, left: 96, bg: 10 },
    { id: `rightBottomHid1`, top: 694, left: 394, bg: 10 }
];

const tet_colors = [
    new RGB(51, 204, 0, 4),
    // new RGB(0, 255, 0, 4),
    new RGB(255, 0, 0, 4),
    new RGB(0, 0, 255, 4),
    // new RGB(255, 0, 255, 4)
    new RGB(204, 0, 204, 4)
];

/** @param {HTMLElement} */
function initStyle(styleElement) {

    styleElement.innerHTML += `body { background-color: ${body_bg_color}; }
`;

    for (const border of bg_border_styles) {
        styleElement.innerHTML += `#${border.id} {
    position: absolute;
    width: ${border.bg}px;
    height: ${border.bg}px;
    top: ${border.top}px;
    left: ${border.left}px;
    background-color: rgb(0, 0, 0, 0);
    border: 3px solid rgb(0, 0, 0, 0);
    border-${border.dt[0]}-color: ${bg_border_color};
    border-${border.dt[1]}-color: ${bg_border_color};
    z-index: -1;
}
`
    }

    for (const hid of bg_border_hid_styles) {
        styleElement.innerHTML += `#${hid.id} {
    position: absolute;
    background-color: ${body_bg_color};
    width: ${hid.bg}px;
    height: ${hid.bg}px;
    top: ${hid.top}px;
    left: ${hid.left}px;
    z-index: -1;
}
`
    }

    let i = 0;
    for (const rgb of tet_colors) {
        styleElement.innerHTML += colorStyle(`c${i++}`, rgb, 20, 20, 5);
        styleElement.innerHTML += colorStyle(`r${i - 1}`, rgb, 10, 10, 2);

    }

    return styleElement;
}


/**
 * @param {HTMLElement} elemet
 */
function initBody(elemet) {
    for (const border of bg_border_styles) { elemet.innerHTML += `    <div id="${border.id}"></div>`; }
    for (const hid of bg_border_hid_styles) { elemet.innerHTML += `    <div id="${hid.id}"></div>`; }
}

/**
 * @param {string} name
 * @param {RGB} rgb
 * @param {number} width
 * @param {number} height
 * @param {number} border
 * @returns {string}
 */
function colorStyle(name, rgb, width, height, border) {
    let l_rgb = RGB_bloom(rgb), d_rgb = RGB_bloom(rgb, true);
    return `.${name} {
    width: ${width}px; height: ${height}px;
    background-color: ${rgb};
    border: ${border}px solid ${l_rgb};
    border-bottom-color: ${d_rgb};
    border-left-color: ${d_rgb};
}
`;
}


/**
 * @param {RGB} rgb
 * @param {boolean} dark
 * @returns {RGB}
 */
function RGB_bloom(rgb, dark) { return new RGB(bloom(rgb.r, dark), bloom(rgb.g, dark), bloom(rgb.b, dark), rgb.a); }

/**
 * @param {number} cn
 * @param {boolean} dark
 * @returns {number}
 */
function bloom(cn, dark) { return dark ? (cn - 128 < 0 ? 0 : cn - 128) : (cn + 128 > 255 ? 255 : cn + 128); }
