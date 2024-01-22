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
 * @returns {HTMLStyleElement}
 */
function initStyle() {

    let style = document.createElement('style');
    style.type = 'text/css';

    // for (let i = 1; i < 25; i++) {
    //     style.innerHTML += `.x${i} {left: ${3 * i}8px; }`;
    //     style.innerHTML += `.y${i} {top: ${3 * i}8px; }`;
    // }

    let i = 0;
    for (const v of [[0, 255, 0], [255, 0, 0], [0, 0, 255], [255, 0, 255]]) {
        let l = [
            v[0] == 0 ? 170 : v[0],
            v[1] == 0 ? 170 : v[1],
            v[2] == 0 ? 170 : v[2]
        ];
        let d = [
            v[0] == 255 ? 170 : v[0],
            v[1] == 255 ? 170 : v[1],
            v[2] == 255 ? 170 : v[2]
        ];

        style.innerHTML += `.c${i++} {
        width: 20px; height: 20px;
        background-color: rgb(${v[0]}, ${v[1]}, ${v[2]}, 4);
        border: 5px solid rgb(${l[0]}, ${l[1]}, ${l[2]}, 4);
        border-bottom-color: rgb(${d[0]}, ${d[1]}, ${d[2]}, 4);
        border-left-color: rgb(${d[0]}, ${d[1]}, ${d[2]}, 4);
    }
`;

    }

    return style;
}