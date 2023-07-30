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
</style>

# 文件I/O基础

一个通用的文件IO模型通常包括打开文件、读写文件、关闭文件这些基本操作，主要涉及：`open()`、`read()`、`write()`、`close()`4个函数。

::: details 文件读写示例

```c
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
#include <unistd.h>

int main(void)
{
     char buff[1024];
     int fd1, fd2;
     int ret;
     /* 打开源文件 src_file(只读方式) */
     fd1 = open("./src_file", O_RDONLY);
     if (-1 == fd1) return fd1;
     /* 打开目标文件 dest_file(只写方式) */
     fd2 = open("./dest_file", O_WRONLY);
     if (-1 == fd2)
     {
         ret = fd2;
         goto out1;
     }
     /* 读取源文件 1KB 数据到 buff 中 */
     ret = read(fd1, buff, sizeof(buff));
     if (-1 == ret) goto out2;
     /* 将 buff 中的数据写入目标文件 */
     ret = write(fd2, buff, sizeof(buff));
     if (-1 == ret) goto out2;
     ret = 0;
out2:
     /* 关闭目标文件 */
     close(fd2);
out1:
     /* 关闭源文件 */
     close(fd1);
     return ret;
}
```

::: 

假设当前目录下这两个文件`src_file`、`dest_file`均存在，首先代码中先调用`open`函数将源文件和目标文件打开，成功打开后再调用`read`函数从源文件中读取1KB数据，然后再调用write函数将这1KB数据写入到目标文件中，读写操作完成后，最后调用close函数关闭源文件和目标文件。

## 文件描述符

<span class="demo" :class="$style.green">**当调用open函数打开一个现有文件或者创建一个新文件时，内核会向进程返回一个文件描述符，用于指代被打开的文件，所有执行IO操作的系统调用都是通过文件描述符来索引到对应的文件。**</span> 例如示例代码中当调用`read/write`函数进行文件读写时，会将源文件`src_file`被打开时所对应的文件描述符`fb1`传送给`read/write`。

一个进程可以打开多个文件，但打开的文件数有限制，打开文件需要占用内存资源，如果超过进程可打开的最大文件数限制，内核将会发送警告信号给对应进程，然后结束进程。

在Linux系统下，可通过`ulimit`命令来查看进程可打开的最大文件数，用法如下：

![](https://hyh1370039199-1313349927.cos.ap-chengdu.myqcloud.com/img/image-20230425204524566.png)

对于一个进程来说，文件描述符是一种有限资源，文件描述符是从0分配的，由此可知文件描述符数字最大值为1023.每一个被打开的文件在同一个进程中都有一个唯一的文件描述符，不会重复，如果文件被关闭后，它对应的文件描述符将会被释放，那么这个文件描述符将可以再次分配给其它打开的文件、与对应的文件绑定起来。

<span class="demo" :class="$style.green">**在程序中，调用`open`函数打开文件时，分配的文件描述符一般都是从3开始。0，1，2三个文件描述符已经默认被系统占用了，分别分配给了系统标准输入（0）、标准输出（1）以及标准错误（2）.**</span>

## open打开文件

`open`函数可用于打开文件，创建文件。函数原型如下：

```c
#include <sys/types.h>
#include <sys/stat.h>
#include <fcntl.h>
int open(const char *pathname, int flags);
int open(const char *pathname, int flags, mode_t mode);
```

<span class="demo" :class="$style.green">**在Linux系统下，可以通过man命令来查看某一个Linux系统调用的帮助信息，man命令可以将该系统调用的详细信息显示出来，例如函数功能介绍、函数原型、参数、返回值以及使用该函数所需包含的头文件信息。**</span>



