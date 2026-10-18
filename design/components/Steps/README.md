# Steps

步骤条：一段 3–5 步的短流程走到哪了。做完的是墨，当前这一步是黄贴纸，还没到的是线框。

## 结构
```html
<ol class="rf-steps" aria-label="Setup">
  <li class="rf-step is-done"><span class="rf-step__mark"><i class="rf-i rf-i-check"></i></span><span class="rf-step__label">Your team</span></li>
  <li class="rf-step is-current" aria-current="step"><span class="rf-step__mark">2</span><span class="rf-step__label">Computer</span></li>
  <li class="rf-step"><span class="rf-step__mark">3</span><span class="rf-step__label">First agent</span></li>
</ol>
```

## 规则
- 方块 20、`radius-xs`，数字用 Space Mono 12；标签 13/18 600。还没到的方块是 1px `line-seam` 线框；步与步之间是一条 `line-seam` 短线。
- 窄的地方用 `rf-steps--compact`：只留当前这一步的字。
- 超过 5 步，就该拆成两段流程。引导页的大号步骤签（Step 1 of 3）属于品牌页面，另算。
