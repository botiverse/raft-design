# Code

代码：句子里的一个名字用行内代码；要用户复制去运行的一行用命令行；成段的代码用代码块。

## 什么时候用
| 情况 | 用 |
| --- | --- |
| 句子里的变量名、按键、文件名 | `rf-code` |
| 一行要复制去跑的命令（连接电脑、安装 CLI） | `rf-cmd` 加复制按钮 |
| 多行代码、日志 | `rf-codeblock`，可以带 `rf-codeblock__head`（文件名加复制） |

## 结构
```html
<code class="rf-code">RAFT_TOKEN</code>
<div class="rf-cmd"><span class="rf-cmd__text"><span class="rf-cmd__prompt">$ </span>npx raft connect --token rft_8f3a…</span><button type="button" class="rf-iconbtn rf-iconbtn--sm" aria-label="Copy command"><i class="rf-i rf-i-copy"></i></button></div>
<pre class="rf-codeblock"><div class="rf-codeblock__head"><span class="rf-codeblock__title">raft.config.ts</span><button type="button" class="rf-iconbtn rf-iconbtn--sm" aria-label="Copy code"><i class="rf-i rf-i-copy"></i></button></div>…</pre>
```

## 规则
- 全部用 Space Mono：行内代码是正文字号的 0.875 倍，命令行和代码块 13/20。
- 命令行和代码块是 `code` 底（亮色白、暗色 `#0a0c10`）加发丝线；行内代码是 `surface-sunken` 底。
- 复制后图标换成勾，几秒后换回；`$ ` 提示符不被复制。
- 命令太长就截断，不折行；代码块横向滚动。
