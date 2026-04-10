import { defineConfig } from 'vitepress'

export default defineConfig({
  title: " ",
  description: "Component Lifecycle documentation",
  base: '/component-lifecycle/',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/favicon.png' }]
  ],

  themeConfig: {
    logo: "/logo.svg",
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/palcarazm/component-lifecycle" }
    ],
    outline: [2, 6],

    nav: [
      { text: "Home", link: "/" },
      { text: "Getting Started", link: "/getting-started" },
      { text: "Architecture", link: "/architecture" },
      { text: "API", link: "/api/README.md" }
    ],

    sidebar: {
      "/": [
        {
          text: "Documentation",
          collapsed: false,
          items: [
            { text: "Introduction", link: "/" },
            { text: "Getting Started", link: "/getting-started" },
            { text: "Architecture", link: "/architecture" },
            { text: "Lifecycle", link: "/lifecycle" },
            { text: "Events", link: "/events" },
            { text: "Examples", link: "/examples" },
            { text: "FAQ", link: "/faq" },
          ]
        }
      ],

      "/api/": [
        {
          text: "API Reference",
          collapsed: false,
          items: [
            { text: "Overview", link: "/api/README.md" },
            { text: "Classes", items: [{text: "Component", link: "/api/classes/Component.md"}] },
            { text: "Enumerations", items: [{text: "LifecycleState", link: "/api/enumerations/LifecycleState.md"}] },
            { text: "Type Aliases", items: [
                {text: "LifecycleEventDetails", link: "/api/type-aliases/LifecycleEventDetails.md"},
                {text: "LifecycleEventMap", link: "/api/type-aliases/LifecycleEventMap.md"},
              ]
            },
          ]
        }
      ]
    }
  }
})
