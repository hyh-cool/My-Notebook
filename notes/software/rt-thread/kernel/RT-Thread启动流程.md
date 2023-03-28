

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

#### 1.1 开辟栈空间和堆空间

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303231503273.png)

这段代码定义一个名为`STACK`的程序区域，其大小为`Stack_Size` ，即0x400。这个程序区域是作为栈空间的，它不需要初始化，可读写，并按照2^3字节对齐，即8字节对齐。

接着，使用`SPACE`指令分配了`Stack_Size` 大小的内存空间，并将其命名为`Stack_Mem` 。

最后定义了一个名为`__initial_sp`的符号，它表示栈顶地址，栈是由高向低生长的。这个值在启动程序时会被设置为 `Stack_Mem + Stack_Size`。

| 指令名称  |                             作用                             |
| :-------: | :----------------------------------------------------------: |
|  **EQU**  |        给数字常量取一个符号名，相当于C语言中的define         |
| **AREA**  |                 汇编一个新的代码段或者数据段                 |
| **SPACE** |                         分配内存空间                         |
| **ALIGN** | 编译器对指令或者数据的存放地址进行对齐，一般需要跟一个立即数，缺省代表4字节对齐。该指令不是ARM指令，是编译器指令。 |

 ![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303231508124.png)

这段代码定义了一个名为`HEAP`的程序区域，其大小为`Heap_Size`，即0x200。它不需要初始化，可读写，并按照2^3`字节对齐`，即8字节对齐。

接着定义了一个名为`__heap_size`的符号，用于指示`HEAP`区域的起始地址。然后定义了一个名为`Heap_Mem`的符号，指示了`HEAP`区域的大小，大小为`Heap_Size`字节。

最后定义了一个名为`__heap_limit`的符号，用于表示`HEAP`区域的结束地址，即`__heap_base + Heap_Size`。

#### 1.2 中断向量表

<img src="https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303231624255.png"  style="zoom:67%;" />

|   指令名称    |                            作用                             |
| :-----------: | :---------------------------------------------------------: |
| **PRESERVE8** |               **指定当前文件保持八字节对齐**                |
|   **THUMB**   |   **表示后面指令兼容THUMB指令，cotex-M4采用的是THUMB-2**    |
|  **EXPORT**   |       **声明一个标号具有全局属性，可被外部文件使用**        |
|    **DCD**    | **以字为单位分配内存，要求4字节对齐，并要求初始化这些内存** |
|  **IMPORT**   |     **声明标号来自外部文件，跟C语言的extern关键字类似**     |

上图中的 `AREA` 定义了一段名为 `RESET` 的 `READONLY` 只读数据段，只读属性保存在 Flash 区。并声明了

`__Vectors`、`__Vectors_End`、`__Vectors_Size`这三个标号具有全局属性，可供外部文件调用。

`__Vectors` 为向量表起始地址，`__Vectors_End` 为向量表结束地址，两个相减即可算出向量表大小`__Vectors_Size`。

向量表从FLASH的0地址开始放置，以4个字节为一个单位，地址0存放的是栈顶地址，0x04存放的是复位程序的地址。向量表中存放的都是中断服务函数的函数名。中断向量表的建立类似于使用C语言定义了一个指针数组，其每一个成员都是一个函数指针，分别指向各个中断服务函数。

#### 1.3 Reset_Handler系统启动

系统上电或者复位后首先执行的代码就是复位中断服务函数 `Reset_Handler`。

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303231719965.png)

|   **指令名称**    |                           **作用**                           |
| :---------------: | :----------------------------------------------------------: |
|     **PROC**      |        **定义子程序，与ENDP成对使用，表示子程序结束**        |
|       **B**       |                      **跳转到一个标号**                      |
|     **WEAK**      | **编译器指令，弱定义，如果外部文件声明了一个标号，则优先使用外部文件定义的标号，如果外部文件没有定义也不出错。** |
|      **END**      |                 **到达文件的末尾，文件结束**                 |
| **IF,ELSE,ENDIF** |         **汇编条件分支语句，跟C语言的if else 类似**          |

这段代码使用了ARM汇编的`AREA`指令定义了一个名为“.text”的段，表示这段代码将被编译到程序的代码段中，且只读。

并且定义了名为Reset_Handler的函数，这个函数在复位时会被执行。其使用`EXPORT`指令将`Reset_Handler`函数导出，表示该函数可以被链接到其他模块中。

使用 `IMPORT` 指令导入 `SystemInit` 和 `__main` 函数，表示这两个函数在该模块中没有定义，需要从其他模块中链接。

将 `SystemInit` 函数的地址加载到寄存器 R0 中，使用 BLX 指令跳转到该地址，执行系统初始化操作。

将 `__main` 函数的地址加载到寄存器 R0 中，使用 BX 指令跳转到该地址，执行主函数。

#### 1.4 中断服务程序

![image-20230327113400942](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303271134797.png)

193行~405行这段代码定义了一系列异常处理函数，包括`HardFault_Handler`、`PendSV_Handler`、`SysTick_Handler` 等。这些函数都被定义为无限循环的代码，可以被修改为实际的异常处理代码。

然后定义了一个名为`Default_Handler` 的函数，用于处理其他没有被显式定义的中断，该函数定义了一系列默认中断处理函数，包括 `WWDG_IRQHandler`、`PVD_PVM_IRQHandler`、`TAMP_STAMP_IRQHandler` 等等。这些函数也被定义为无限循环的代码，可以被修改为实际的中断处理代码。使用 `EXPORT` 指令将每个异常处理函数和默认中断处理函数导出，表示这些函数可以被链接到其他模块中。使用 `ALIGN` 指令对代码进行对齐，以提高执行效率。

#### 1.5 初始化堆栈

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303271154245.png)

这段代码首先使用`IF`指令判断是否定义了`__MICROLIB`宏。如果使用了`MicroLib`库，则导出 `__initial_sp`、`__heap_base` 和 `__heap_limit` 三个符号。其中 `__initial_sp` 表示初始堆栈指针，`__heap_base` 和 `__heap_limit` 分别表示堆的起始地址和结束地址。

如果没有使用 `MicroLib` 库，则定义 `__user_initial_stackheap` 符号，并使用 LDR 指令加载堆和栈的地址。具体来说，R0 寄存器中存储的是堆的起始地址（Heap_Mem），R1 寄存器中存储的是栈顶地址（Stack_Mem + Stack_Size），R2 寄存器中存储的是堆的结束地址（Heap_Mem + Heap_Size），R3 寄存器中存储的是栈底地址（Stack_Mem）。然后使用 BX LR 指令跳转到函数返回地址。

::: warning 注意

栈的概念既可以用于计算机中的内存管理，也可以用于数据结构中。在数据结构中，栈也是一种后进先出（Last-In-First-Out, LIFO）的数据结构，只不过它通常是在堆上实现的，而不是在栈上。在数据结构中，栈的栈顶指针指向最后一个元素，而不是最高地址的栈单元。这与计算机中的栈有所区别。

值得注意的是，计算机中的栈和数据结构中的栈虽然概念上有所区别，但它们的本质都是相同的：它们都是一种后进先出的数据结构，只是实现方式和应用场景不同。

::: 

关于STM32内存分布问题详情见[RT-Thread程序内存分布](./RT-Thread程序内存分布.md)一文。

### **2.C语言部分 --- rtthread_startup函数说明**

功能函数`$Sub$$main`：

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303281519160.png)

进入`rtthread_startup`函数后执行了一系列操作，如下图：

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303271638497.png)

#### 2.1 RT-Thread开关中断

```asm
;/*
; * rt_base_t rt_hw_interrupt_disable();
; */
rt_hw_interrupt_disable    PROC      ;PROC伪指令定义函数
    EXPORT  rt_hw_interrupt_disable  ;EXPORT输出定义的函数，类似于与C语言extern
    MRS     r0, PRIMASK              ;读取PRIMASK寄存器的值到r0寄存器
    CPSID   I						 ;关闭全局中断
    BX      LR						 ;函数返回
    ENDP                             ;函数结束

;/*
; * void rt_hw_interrupt_enable(rt_base_t level);
; */
rt_hw_interrupt_enable    PROC
    EXPORT  rt_hw_interrupt_enable
    MSR     PRIMASK, r0              ;将r0寄存器的值写入到PRIMASK寄存器
    BX      LR						 ;函数返回									
    ENDP
```

`rt_hw_interrupt_disable`该函数的作用是禁用CPU中断。具体来说，它使用了汇编指令`MRS`来读取当前处理器状态寄存器（PRIMASK）的值，然后使用指令`CPSID`来将中断禁用位(I)设置为1，最后使用指令`BX LR`返回函数调用处。

`rt_hw_interrupt_enable`该函数的作用是启用CPU中断。具体来说，它使用了汇编指令`MSR`来将传递给函数的参数(level)的值存入处理器状态寄存器(PRIMASK)中，然后使用指令`BX LR`返回函数调用处。

#### 2.2 板级硬件初始化 - rt_hw_board_init


- 设置中断向量表的基地址，具体是根据宏定义的 `VECT_TAB_RAM` 还是 `VECT_TAB_FLASH` 来选择基地址，这个基地址告诉 CPU 当中断发生时去哪里找到中断服务程序的入口。

```c
/* NVIC Configuration */
#define NVIC_VTOR_MASK              0x3FFFFF80
#ifdef  VECT_TAB_RAM
    /* Set the Vector Table base location at 0x10000000 */
    SCB->VTOR  = (0x10000000 & NVIC_VTOR_MASK);
#else  /* VECT_TAB_FLASH  */
    /* Set the Vector Table base location at 0x08000000 */
    SCB->VTOR  = (0x08000000 & NVIC_VTOR_MASK);
#endif
```
- 首先是Hal库的初始化，包括配置Flash预取、Systick配置等；然后调用`SystemClock_Config`进行系统时钟配置,接着初始化GPIO、串口；如果使用了RT-Thread 的控制台功能，则设置控制台设备为 `RT_CONSOLE_DEVICE_NAME`。
```c
/* HAL_Init() function is called at the beginning of program after reset and before
 * the clock configuration.
 */
    HAL_Init();
    SystemClock_Config();	
/* First initialize pin port,so we can use pin driver in other bsp driver */
#ifdef BSP_USING_GPIO
    rt_hw_pin_init();
#endif
/* Second initialize the serial port, so we can use rt_kprintf right away */
#ifdef RT_USING_SERIAL
    stm32_hw_usart_init();
#endif
```

-  接着是RT-Thread的动态内存管理，将`HEAP_BEGIN`与`HEAP_END`之间的内存空间作为动态内存空间交由RT-Thread进行管理。对于`RT_USING_MEMHEAP`宏定义开启情况下的内存管理应用详情见[RT-Thread内存管理](./RT-Thread内存管理.md)一文。

```c
#define HEAP_BEGIN    (&Image$$RW_IRAM1$$ZI$$Limit)
#define HEAP_END                STM32_SRAM_END
#define STM32_SRAM_SIZE         96
#define STM32_SRAM_END          (0x20000000 + STM32_SRAM_SIZE * 1024)

#if defined(RT_USING_MEMHEAP) && defined(RT_USING_MEMHEAP_AS_HEAP)
    rt_system_heap_init((void *)HEAP_BEGIN, (void *)HEAP_END);
    rt_memheap_init(&system_heap, "sram2", (void *)STM32_SRAM2_BEGIN, STM32_SRAM2_HEAP_SIZE);
#else
    rt_system_heap_init((void *)HEAP_BEGIN, (void *)HEAP_END);
#endif
```

`&Image$$RW_IRAM1$$ZI$$Limit`是一个链接脚本文件中的符号。`&`表示获取地址，`Image`表示链接脚本文件的名称，`RW_IRAM1`表示内存段的名称，`ZI`表示该段为未初始化数据段，`Limit`表示该段的结束位置。因此，`&Image$$RW_IRAM1$$ZI$$Limit`表示该段未初始化数据段的结束地址的指针，即动态内存分配的起始地址。

- 板级组件初始化：首先，它检查是否启用了`RT_USING_COMPONENTS_INIT`宏定义，若启用，就调用了`rt_components_board_init`函数。该函数实现了一种自动初始化机制，初始化函数不需要被显式调用，只需要在函数定义处通过宏定义的方式进行申明，就会在系统启动过程中被执行。详情见[RT-Thread自动初始化机制](./RT-Thread自动初始化机制.md)。

