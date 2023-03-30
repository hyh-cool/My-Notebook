# RT-Thread 程序内存分布

一般MCU包含的存储空间有片内Flash与片内RAM，RAM相当于内存，Flash相当于硬盘。编译器会将一个程序分类为好几个部分，分别存储在MCU不同的存储区。

Keil工程在编译完之后，会有相应的程序所占用的空间提示信息，如下所示：

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303291437382.png)

上图的`Program Size`包含以下几个部分：

- `Code`：代码段，存放程序的代码部分；
- `RO-data`：只读数据段，存放程序中定义的常量；
- `RW-data`：读写数据段，存放初始化为非 0 值的全局变量；
- `ZI-data`：0 数据段，存放未初始化的全局变量及初始化为 0 的变量；

编译完工程后会生成一个.map文件，该文件说明了各个函数占用的大小和地址，文件最后说明了几个字段的关系：

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303291448419.png)

- `RO Size`包含了`Code`及`RO-data`，表示程序占用Flash空间的大小；
- `RW Size`包含了`RW-data`及`ZI-data`，表示运行时占用的RAM的大小；
- `ROM Size` 包含了 `Code`、`RO-data` 以及 `RW-data`，表示烧写程序所占用的 Flash 空间的大小；

程序运行之前，需要将可执行映像文件，一般是`bin`或者`hex`文件，烧录到MCU的Flash中，如下图左边部分所示，是可执行映像文件烧录到STM32的内存分布，它包含RO段和RW段两个部分：其中`RO`段中保存了`Code`、`RO-data`的数据，`RW`段保存了`RW-data`的数据，由于`ZI-data`都是0，所以未包含在映像文件中。

STM32 在上电启动之后默认从 Flash 启动，启动之后会将 `RW` 段中的 `RW-data`（初始化的全局变量）搬运到 RAM 中，但不会搬运 `RO` 段，即 CPU 的执行代码从 Flash 中读取，另外根据编译器给出的 `ZI` 地址和大小分配出 `ZI` 段，并将这块 RAM 区域清零。

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303291523237.png)

其中动态内存堆为未使用的RAM空间，应用程序申请和释放的内存块都来自该空间。

```c
rt_uint8_t* msg_ptr;
msg_ptr = (rt_uint8_t*) rt_malloc (128);
rt_memset(msg_ptr, 0, 128);
```

代码中的 `msg_ptr` 指针指向的 128 字节内存空间位于动态内存堆空间中。

而一些全局变量则是存放于 `RW` 段和 `ZI` 段中，`RW` 段存放的是具有初始值的全局变量（而常量形式的全局变量则放置在 `RO` 段中，是只读属性的），`ZI` 段存放的系统未初始化的全局变量。

```c
#include <rtthread.h>

const static rt_uint32_t sensor_enable = 0x000000FE;
rt_uint32_t sensor_value;
rt_bool_t sensor_inited = RT_FALSE;

void sensor_init()
{
     /* ... */
}
```

`sensor_value` 存放在 `ZI` 段中，系统启动后会自动初始化成零（由用户程序或编译器提供的一些库函数初始化成零）。`sensor_inited` 变量则存放在 `RW` 段中，而 `sensor_enable` 存放在 `RO` 段中。

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303291543715.png)

上图是Keil编译后，`.map`文件的内存分布。通过该文件，我们可得该程序下的RAM内存分配的示意图：

<img src="https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303291607967.png"  style="zoom:67%;" />

对于上图中的系统堆`HEAP`、系统栈`STACK`的空间是由启动汇编文件中的定义决定的。`.data`段、`.bss`段的空间会在程序编译后获知大小，RAM剩余空间部分，如果程序中使能了内存堆，那么从栈顶地址到RAM结束地址都是RT-Thread的内存堆，受RT-Thread内存管理方式管理。

关于RAM结束地址的计算方式，可以通过Keil工程的选项来获知，

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303291558706.png)

或者通过代码计算：`ram_end_address = ram_start_address + stm32_sram_size * 1024`

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/202303291613140.png)

