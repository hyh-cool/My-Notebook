# RT-Thread 启动流程

## 一、介绍

在裸机程序中，一般在.s文件中就跳转至`__main`进而跳转至`main()`函数启动；而RT-Thread启动会先跳转到其启动函数`rtthread_startup()`进行一系列初始化，最后再跳转至`main()`函数。

![启动流程](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303171029418.png)

见上图，该图详细地表明`rtthread_startup()`都进行了哪些初始化。

为了在进入`main()`函数之前完成RT-Thread系统功能初始化，RT-Thread使用了MDK的扩展功能`$Sub$$` 和 `$Super$$`.可以给`main`函数添加`$Sub$$` 前缀符号作为一个新功能函数`$Sub$$main` ，`$Sub$$main` 可以先调用一些要补充在`main`之前的功能函数，然后再调用`$Super$$main`转到`main()`函数执行。

关于 `$Sub$$` 和 `$Super$$` 扩展功能的使用，可以参考[ARM Compiler v5.06 for µVision armlink User Guide](https://developer.arm.com/documentation/dui0377/g/Accessing-and-Managing-Symbols-with-armlink/Use-of--Super---and--Sub---to-patch-symbol-definitions?lang=en).

## 二、源码分析

### 1.汇编部分 --- startup_xxx.s文件解析

以 MDK环境下的 `startup_stm32xxx.s`汇编文件为例，来分析一下STM32的启动过程。

#### 开辟栈空间和堆空间



### 2.C语言部分 --- rtthread_startup函数说明
