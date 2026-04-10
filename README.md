[![GitHub license](https://img.shields.io/github/license/palcarazm/component-lifecycle.svg?color=informational)](https://github.com/palcarazm/component-lifecycle/blob/master/LICENSE)
[![Latest release](https://img.shields.io/github/package-json/v/palcarazm/component-lifecycle/v1?logo=github)](https://github.com/palcarazm/component-lifecycle/releases)
[![Bootstrap 5](https://img.shields.io/static/v1?label=bootstrap&message=%5E5.3.0&color=informational&logo=bootstrap&logoColor=white)](https://getbootstrap.com/docs/5.3)
[![JSDelivr Badge](https://img.shields.io/jsdelivr/npm/hm/component-lifecycle?label=hits&logo=jsdelivr&logoColor=white)](https://www.jsdelivr.com/package/npm/component-lifecycle)
[![NPM Badge](https://img.shields.io/npm/dm/component-lifecycle?logo=npm)](https://www.npmjs.com/package/component-lifecycle)
[![EOL](https://img.shields.io/endpoint?url=https%3A%2F%2Fpalcarazm.github.io%2Fcomponent-lifecycle%2Fapi%2Feol%2Fv1)](https://github.com/palcarazm/component-lifecycle/security/policy)
[![Funding](https://img.shields.io/badge/sponsor-30363D?style=flat&logo=GitHub-Sponsors&logoColor=#white)](https://github.com/sponsors/palcarazm)

[![Coverage Status](https://img.shields.io/coverallsCoverage/github/palcarazm/component-lifecycle?branch=v5&logo=coveralls)](https://coveralls.io/github/palcarazm/component-lifecycle?branch=v5)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=palcarazm_component-lifecycle&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=palcarazm_component-lifecycle)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=palcarazm_component-lifecycle&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=palcarazm_component-lifecycle)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=palcarazm_component-lifecycle&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=palcarazm_component-lifecycle)
[![Security](https://img.shields.io/badge/security-monitored-informational?logo=snyk)](https://snyk.io/advisor/npm-package/component-lifecycle)

# 📦 `component-lifecycle`

A lightweight, framework‑agnostic lifecycle engine for DOM components with typed events, a strict state machine, and ergonomic event APIs.

👉 **Full documentation:** https://palcarazm.github.io/component-lifecycle/

---

## ✨ Features

- Full lifecycle: `init → attach → dispose → destroy`
- Strict finite state machine with validated transitions
- Typed events with static prefixes (`on`, `once`, `off`)
- Framework‑agnostic and dependency‑free
- Introspection: current state, allowed transitions, history
- TypeScript‑first design

---

## 🚀 Installation

```bash
npm install component-lifecycle
```

---

## 🧩 Quick Start

```ts
import { Component } from "component-lifecycle";

class MyComponent extends Component<"my-component"> {
    protected readonly PREFIX = "my-component";

    protected onInit() {
        console.log("initialized");
    }
}

const element = document.querySelector("#my-element");
const c = new MyComponent(element);

c.init();
```

---

## 🎧 Typed Events

```ts
const c = new MyComponent(element);

c.on("my-component:initialized", (ev) => {
    console.log(ev.detail.component);
});
```

---

# Collaborators welcome!

- :sos: Do you need some help? Open a thread in [GitHub Discussions Q&A](https://github.com/palcarazm/component-lifecycle/discussions/new?category=q-a)
- :bug: Do you find a bug? Open an issue in [GitHub bug report](https://github.com/palcarazm/component-lifecycle/issues/new?template=01-BUG_REPORT.yml)
- :bulb: Do you have a great idea? Open an issue in [GitHub feature request](https://github.com/palcarazm/component-lifecycle/issues/new?template=02-FEATURE_REQUEST.yml)
- :computer: Do you know how to fix a bug? Open a pull request in [GitHub pull request](https://github.com/palcarazm/component-lifecycle/compare).

[![GitHub Contributors](https://contrib.rocks/image?repo=palcarazm/component-lifecycle)](https://github.com/palcarazm/component-lifecycle/graphs/contributors)

¿Do you like the project? Give us a :star: in [GitHub](https://github.com/palcarazm/component-lifecycle).