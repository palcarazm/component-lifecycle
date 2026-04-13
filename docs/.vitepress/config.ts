import { defineConfig } from 'vitepress'

export default defineConfig({
  title: " ",
  description: "A lightweight, framework-agnostic lifecycle engine for DOM components with typed events, a strict state machine, and ergonomic event APIs.",
  base: '/component-lifecycle/',

  head: [
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/component-lifecycle/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', href: '/component-lifecycle/favicon.png' }],
    ['meta', { name: 'author', content: 'https://github.com/palcarazm' }],
    ['meta', { name: 'robots', content: 'index, follow' }],
    ['meta', { name: 'revisit-after', content: '1 month' }],
    ['meta', { property: 'og:description', content: 'A lightweight, framework-agnostic lifecycle engine for DOM components with typed events, a strict state machine, and ergonomic event APIs.' }],
    ['meta', { property: 'og:url', content: 'https://palcarazm.github.io/component-lifecycle' }],
    ['meta', { property: 'og:image', content: 'https://palcarazm.github.io/component-lifecycle/card.png' }],
    ['meta', { property: 'og:image:width', content: '728' }],
    ['meta', { property: 'og:image:height', content: '364' }],
  ],

  themeConfig: {
    logo: "/logo.png",
    search: {
      provider: 'local'
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/palcarazm/component-lifecycle" }
    ],
    outline: [2, 3],

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
                {text: "BaseEventMap", link: "/api/type-aliases/BaseEventMap.md"},
                {text: "ComponentOptions", link: "/api/type-aliases/ComponentOptions.md"},
                {text: "ExtendableComponentOptions", link: "/api/type-aliases/ExtendableComponentOptions.md"},
                {text: "ExtendableEventMap", link: "/api/type-aliases/ExtendableEventMap.md"},
                {text: "LifecycleEventDetails", link: "/api/type-aliases/LifecycleEventDetails.md"},
                {text: "LifecycleEventMap", link: "/api/type-aliases/LifecycleEventMap.md"},
                {text: "TransitionEventDetails", link: "/api/type-aliases/TransitionEventDetails.md"},
                {text: "TransitionEventMap", link: "/api/type-aliases/TransitionEventMap.md"},
              ]
            },
          ]
        }
      ]
    }
  }
})
