import { path } from "@vuepress/utils";

module.exports = {
  title: "hyh's Note",
  description: "hyh's notebook.",

  head: [
    ["link", { rel: "icon", href: "/favicon.jpg" }],
    [
      "meta",
      {
        name: "viewport",
        content: "width=device-width,initial-scale=1,user-scalable=no"
      }
    ]
  ],

  theme: path.resolve(__dirname, "./theme"),

  bundler: "@vuepress/vite",

  themeConfig: {
    logo: "/apple-touch-icon.png",

    repo: "hyh-cool/note.hyh.cool",
    docsDir: "notes",
    docsBranch: "master",

    author: "hyh",
    authorLink: "https://hyh.cool",

    navbar: [
      {
        text: "Software",
        children: [
          {
            text: "Algorithms",
            link: "/software/algo/"
          },
          {
            text: "Os",
            link: "/software/os/"
          },
          {
            text: "Network",
            link: "/software/network/"
          },
          {
            text: "RT-Thread",
            link: "/software/rt-thread/"
          },
        ]
      },
      {
        text: "Hardware",
        children: [
          {
            text: "Basic",
            link: "/hardware/basic/"
          }
        ]
      },
      {
        text: "Reading",
        link: "/reading/"
      },
      {
        text: "Snippets",
        link: "/snippets/"
      },
      {
        text: "Tools",
        link: "/tools/"
      },
      {
        text: "To do List",
        link: "/to-do-list/"
      },
    ],

    sidebar: {
      "/software/algo/": [
        {
          text: "时间、空间复杂度",
          children: [
            "/software/algo/basic/时间、空间复杂度分析.md"
          ]
        },
        {
          text: "基础数据结构",
          children: [
            "/software/algo/basic/数组.md",
            "/software/algo/basic/链表.md",
            "/software/algo/basic/链表实现.md",
            "/software/algo/basic/栈.md",
            "/software/algo/basic/队列.md",
          ]
        },
      ]
    }
  },

  plugins: [["@vuepress/plugin-search"], ["@renovamen/vuepress-plugin-katex"]],

  markdown: {
    extractHeaders: {
      level: [2, 3, 4, 5]
    },
    code: {
      lineNumbers: true
    }
  }
};
