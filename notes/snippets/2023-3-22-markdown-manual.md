---
date: 2023-3-22
---
# Markdown 语法速查
> 记录使用Markdown文档渲染生成笔记的一些语法，方便后续查阅。

<!-- more -->

### 设置字体颜色

#### 方法一：

```vue
<p class="demo" :class="$style.example"></p>

<style module>
.example {
  color: #41b883;
}
</style>

<script>
export default {
  props: ['slot-key'],
  mounted () {
    document.querySelector(`.${this.$style.example}`)
      .textContent = '这个块是被内联的脚本渲染的，样式也采用了内联样式。'
  }
}
</script>
```

<span class="demo" :class="$style.example"></span>

<style module>
.example {
  color: #41b883;
}
.green {
  color: #41b883;
}
.red{
  color: #FF0000;
}
.blue{
  color: #008080;
}  
</style>
<script>
export default {
  props: ['slot-key'],
  mounted () {
    document.querySelector(`.${this.$style.example}`)
      .textContent = '这个块是被内联的脚本渲染的，样式也采用了内联样式。'
  }
}
</script>

#### 方法二：

```vue
<style module>
.green {
  color: #41b883;
}
.red{
  color: #FF0000;
}
.blue{
  color: #008080;
}    
</style> // 文章开头先添加这几个样式
<span class="demo" :class="$style.green">绿色</span>
<span class="demo" :class="$style.red">红色</span>
<span class="demo" :class="$style.blue">蓝色</span>
```

<span class="demo" :class="$style.green">绿色</span>
<span class="demo" :class="$style.red">红色</span>
<span class="demo" :class="$style.blue">蓝色</span>

### 自定义容器

::: tip
这是一个提示
:::

::: warning
这是一个警告
:::

::: danger
这是一个危险警告
:::

::: details
这是一个 details 标签
:::