---
date: 2023-3-22
---

# Git 命令速查

> 记录git命令，方便后续查阅
>

<!-- more -->

[[toc]]

## 创建新仓库

创建新文件夹，打开，然后执行`git init`以创建新的git仓库。

## 添加Git全局配置

添加github用户名和邮箱

```bash
git config --global user.name <github用户名>
```

```bash
git config --global user.email <github绑定邮箱>
```

## 检出仓库

执行如下命令从git远程仓库检出项目代码到本地

```bash
git clone git@github.com:<github用户名>/<github仓库名>.git
```

## 工作流

本地仓库由git维护的三棵“树”组成。第一个是你的`工作目录`，它持有实际文件；第二个是`暂存区(Index)`,它像个缓存区域，临时保存改动部分；最后是`HEAD`，它指向你最后一次提交结果。

## 添加和提交

提出更改（把它们添加到暂存区），使用如下命令：

```bash
git add <filename>
```

```bash
git add *
```

使用如下命令以实际提交改动：

```bash
git commit -m "代码提交信息"
```

现在，改动已经提交到了`HEAD`，但是还没有提交到远端仓库。

## 推送改动

执行如下命令，将这些改动提交到远端仓库：

```bash
git push origin <branch>
```

如果你还没有克隆现有仓库，并欲将你的仓库连接到某个远程仓库，你可以使用如下命令添加：

```
git remote add origin git@github.com:<github用户名>/<github仓库名>.git
```

这样你就能够将你的改动推送到所添加的服务器上去了。

强制推送到远端仓库某一个分支：

```bash
git push -f origin <branch>
```

## 分支

分支是用来将特性开发绝缘开来的。在你创建仓库的时候，`master`是默认分支。在其他分支上进行开发，完成后再将它们合并到主分支上。

创建一个叫做“feature_x”的分支，并切换过去：

```bash
git checkout -b feature_x
```

切换回主分支：

```bash
git checkout master
```

再把新建的分支删掉：

```bash
git branch -d feature_x
```

除非将分支推送到远端仓库，不然该分支就是 *不为他人所见的*：

```bash
git push origin <branch>
```

## 更新与合并

- 要更新本地仓库至最新改动，执行：

```bash
git pull
```

- 在你的工作目录中获取(fetch)并合并(merge)远端的改动。要合并其他分支到你的当前分支（例如 master），执行：

```bash
git merge <branch>
```

在上面这两种情况下，git 都会尝试去自动合并改动。遗憾的是，这可能并非每次都成功，并可能出现**冲突(conflicts)**。

这时就需要你修改这些文件来手动合并这种冲突。改完之后，需要执行如下命令将它们标记为合并成功：

```bash
git add <filename>
```

在合并改动之前，可以使用如下命令预览差异：

```bash
git diff <source_branch> <target_branch>
```

## 标签

为软件发布创建标签是推荐的。可以执行如下命令创建1.0.0的标签：

```bash
git tag 1.0.0 <commit id>
```

`commit id`是你想要标记的提交ID的前10位字符。可以使用下列命令获取提交ID：

```bash
git log
```

也可以使用少一点的提交ID前几位，只要它的指向具有唯一性。

## log

了解本地仓库的历史记录，使用如下命令：

```bash
git log
```

只看某一个人的提交记录：

```bash
git log --author=<author name>
```

一个压缩后的每一条提交记录只占一行的输出:

```bash
git log --pretty=oneline
```

看看哪些文件改变了:

```bash
git log --name-status
```

更多的信息，参考：

```bash
git log --help
```

## 替换本地改动

可以使用如下命令替换掉本地改动：

```bash
git checkout -- <filename>
```

此命令会使用 `HEAD` 中的最新内容替换掉你的工作目录中的文件。已添加到暂存区的改动以及新文件都不会受到影响。

假如你想丢弃你在本地的所有改动与提交，可以到服务器上获取最新的版本历史，并将你本地主分支指向它：

```bash
git fetch origin
git reset --hard origin/master
```

