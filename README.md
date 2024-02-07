# div tetris

* 基于 div 标签绘制的 web 俄罗斯方块。
* 其实是用 js 重写 https://github.com/binave/tetris 项目

* 如果不打算在 http server 上部署，而在本地浏览。
    * firefox 浏览器打开 `about:config`，设置`security.fileuri.strict_origin_policy` 为 `false` 并重启浏览器。
    * chrome 及 edge 浏览器快捷方式里加上 `--allow-file-access-from-files` 启动参数后再启动。
    * 或者去掉代码中 `import` `export` 相关的部分。


Licensing
=========
devtetris is licensed under the Apache License, Version 2.0. See
[LICENSE](https://github.com/binave/divtetris/blob/master/LICENSE) for the full
license text.
