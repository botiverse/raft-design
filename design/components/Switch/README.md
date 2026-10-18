# Switch

开关：拨了就生效的设置。打开是黄贴纸，圆钮滑到右边；它和 Radio 是系统里仅有的两个圆形控件。

## 什么时候用
- 设置行里，拨了就生效。要点保存才生效的 → Checkbox。

## 结构
```html
<div class="rf-row rf-row--plain">
  <span class="rf-row__body"><span class="rf-row__title" id="merge">Agents can merge to main</span><span class="rf-row__sub rf-row__sub--wrap">Off: a person approves every merge.</span></span>
  <button class="rf-switch" type="button" role="switch" aria-checked="false" aria-labelledby="merge"></button>
</div>
```

## 规则
- 它是一个 `<button type="button" role="switch">`：`aria-checked` 说开没开，`aria-labelledby` 指向这一行的标题；打开时加 `is-on`。不能改时加 `disabled`。
- 50×30 的胶囊。关闭是 `surface-sunken` 底加墨线；打开是 `yellow` 底加墨边，圆钮是白的，暗色里一样。圆钮滑动 220ms，用 bundle.css 里的 `--rf-ease-slide`。
- 说明写后果，不重复标题。不用绿色和蓝色：绿是“完成”和“在线”。
