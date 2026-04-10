# Examples

## Toggle Component

```ts
class Toggle extends Component<"toggle"> {
  protected static readonly PREFIX = "toggle"

  onInit() {
    console.log("Initialized")
  }

  onAttach() {
    console.log("Attached to DOM")
  }
}
```