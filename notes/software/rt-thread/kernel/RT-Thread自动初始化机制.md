# RT-Thread 自动初始化机制

## 一、介绍

自动初始化机制是指初始化函数不需要被显式调用，只需要在函数定义处通过宏定义的方式进行申明，就会在系统启动过程中被执行。

例如在串口驱动中调用宏定义告知系统初始化需要调用的函数，代码如下：

```c
int rt_hw_usart_init(void)  /* 串口初始化函数 */
{
     ... ...
     /* 注册串口 1 设备 */
     rt_hw_serial_register(&serial1, "uart1",
                        RT_DEVICE_FLAG_RDWR | RT_DEVICE_FLAG_INT_RX,
                        uart);
     return 0;
}
INIT_BOARD_EXPORT(rt_hw_usart_init);    /* 使用组件自动初始化机制 */
```

示例代码最后的`INIT_BOARD_EXPORT(rt_hw_usart_init)`表示使用自动初始化功能。

RT-Thread 的自动初始化机制使用了自定义 RTI 符号段，将需要在启动时进行初始化的函数指针放到了该段中，形成一张初始化函数表，在系统启动过程中会遍历该表，并调用表中的函数，达到自动初始化的目的。

用来实现自动初始化功能的宏接口定义详细描述如下表所示：

| 初始化顺序 |            宏接口             |                       描述                       |
| :--------: | :---------------------------: | :----------------------------------------------: |
|   **1**    |   **INIT_BOARD_EXPORT(fn)**   |     **非常早期的初始化，此时调度器还未启动**     |
|   **2**    |   **INIT_PREV_EXPORT(fn)**    | **主要是用于纯软件的初始化、没有太多依赖的函数** |
|   **3**    |  **INIT_DEVICE_EXPORT(fn)**   |       **外设驱动初始化相关，比如网卡设备**       |
|   **4**    | **INIT_COMPONENT_EXPORT(fn)** |      **组件初始化，比如文件系统或者 LWIP**       |
|   **5**    |    **INIT_ENV_EXPORT(fn)**    |       **系统环境初始化，比如挂载文件系统**       |
|   **6**    |    **INIT_APP_EXPORT(fn)**    |          **应用初始化，比如 GUI 应用**           |

## 二、原理

### 自动初始化宏定义

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303291704832.png)

`INIT_EXPORT(fn, level)` 表示这个函数 fn 现在属于哪个初始化 level 段，由 SECTION(".rti_fn."level) 进行定义 。

```c
#define INIT_EXPORT(fn, level)                                                       \
	RT_USED const init_fn_t __rt_init_##fn SECTION(".rti_fn."level) = fn
```

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303291727857.png)

`__attribute__((section("name")))` ：将作用的函数或数据放入指定名为“name”的输入段中。

整个宏定义`INIT_EXPORT(fn, level)` 的作用就是将函数fn的地址赋给一个`__rt_init_##fn`的指针，然后放入相应level的数据段中。函数使用自动初始化宏后，这些数据段中就会存储指向各个初始化函数的指针。

::: warning 注意

`__rt_init_##fn`的`##`符号是连接的意思，举例`INIT_EXPORT(board_init, "1")` 就会生成一个`__rt_init_board_init`的指针.

::: 

举例：

```c
//函数pin_beep_sample()，使用INIT_APP_EXPORT()进行自动初始化。
INIT_APP_EXPORT(pin_beep_sample);
= INIT_EXPORT(pin_beep_sample, "6")
= const init_fn_t __rt_init_pin_beep_sample SECTION(".rti_fn.""6") = pin_beep_sample
/*
表示把函数pin_beep_sample的地址赋值给常量函数指针__rt_init_pin_beep_sample，
然后放入名称为".rti_fn.6"的数据段中。
（其中init_fn_t是一个函数指针类型，原型为typedef int (*init_fn_t)(void)。）  无传入参数、int返回
*/
```

## 三、自动初始化过程

`rt_components_board_init`函数实现：

```c
void rt_components_board_init(void)
{
    const init_fn_t *fn_ptr;
    for (fn_ptr = &__rt_init_rti_board_start; fn_ptr < &__rt_init_rti_board_end; fn_ptr++)
    {
        (*fn_ptr)();
    }
}
```

该函数会遍历位于`__rt_init_rti_board_start` 到 `__rt_init_rti_board_end`之间保存的函数指针，然后依次执行这些函数。

`rt_components_init`函数实现：

```c
void rt_components_init(void)
{
    const init_fn_t *fn_ptr;
    for (fn_ptr = &__rt_init_rti_board_end; fn_ptr < &__rt_init_rti_end; fn_ptr ++)
    {
        (*fn_ptr)();
    }
}
```

该函数会遍历位于`__rt_init_rti_board_end`到 `__rt_init_rti_end`之间保存的函数指针，然后依次执行这些函数。

### 区域划分

<img src="https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303291752146.png"  style="zoom:67%;" />

这几个函数的导出，加上上面6个初始化宏的导出，可以得出下面表格：

|       段名        |          函数指针/宏          |
| :---------------: | :---------------------------: |
|   **.rti_fn.0**   |    **__rt_init_rti_start**    |
| **.rti_fn.0.end** | **__rt_init_rti_board_start** |
|   **.rti_fn.1**   |   **INIT_BOARD_EXPORT(fn)**   |
| **.rti_fn.1.end** |  **__rt_init_rti_board_end**  |
|   **.rti_fn.2**   |   **INIT_PREV_EXPORT(fn)**    |
|   **rti_fn.3**    |  **INIT_DEVICE_EXPORT(fn)**   |
|   **.rti_fn.4**   | **INIT_COMPONENT_EXPORT(fn)** |
|   **.rti_fn.5**   |    **INIT_ENV_EXPORT(fn)**    |
|   **.rti_fn.6**   |    **INIT_APP_EXPORT(fn)**    |
| **.rti_fn.6.end** |     **__rt_init_rti_end**     |

可以看出，这4个空函数所导出的段中间，包含着这6个初始化宏定义的段，而6个段中分别包含着各自宏导出函数时的函数指针。

`rt_components_board_init`完成了第1段，初始化了由`INIT_BOARD_EXPORT(fn)`的宏导出的所有函数，即`__rt_init_rti_board_start` 到 `__rt_init_rti_board_end`之间的函数指针。

`rt_components_init`完成了第2到第6段，初始化了由`INIT_PREV_EXPORT(fn)`、`INIT_DEVICE_EXPORT(fn)`、`INIT_COMPONENT_EXPORT(fn)`、`INIT_ENV_EXPORT(fn)`、`INIT_APP_EXPORT(fn)`的宏导出的所有函数，即`__rt_init_rti_board_end`到`__rt_init_rti_end`之间的函数指针。

### 示例

原始`map`文件如下图所示：

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303301046986.png)

在工程下添加如下代码后：

```c
static int board1_init(void)
{
    return 0;
}
static int board2_init(void)
{
    return 0;
}
INIT_BOARD_EXPORT(board1_init);
INIT_BOARD_EXPORT(board2_init);
static int device1_init(void)
{
    return 0;
}
static int app1_init(void)
{
    return 0;
}
static int app2_init(void)
{
    return 0;
}

INIT_APP_EXPORT(app2_init);
INIT_APP_EXPORT(app1_init);
INIT_DEVICE_EXPORT(device1_init);
```

新`map`文件如下图所示：

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303301115669.png)

