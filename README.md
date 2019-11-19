# react-native-typewriter

A [React Native] component for creating typing effects.
Inspired by [react-typewriter].

## Installation

```
$ yarn add react-native-typewriter
```

OR

```
$ npm install --save react-native-typewriter
```

## Usage

Pass text and a typing direction into the component to control its animation.

```javascript

import React, { Component } from 'react'
import TypeWriter from 'react-native-typewriter'

class TypingText extends Component {
  render() {
    return <TypeWriter typing={1}>Hello World!</TypeWriter>
  }
}
```

## Documentation

Any props accepted by React Native's `Text` component are accepted by `TypeWriter`. These additional props are also accepted:

### typing

type: `Number` default: `0`

A value of 1 types text left to right until completion. A value of -1 erases
text from right to left. A value of 0 stops the animation.

### fixed

type: `Boolean` default: `false`

This flag will ensure the enclosing container's size and shape is fixed.
Prevents the text from shifting around as it grows into its container.

### maxDelay

type: `Number` default: `100`

The maximum delay between each typed token in milliseconds.

### minDelay

type: `Number` default: `20`

The minimum delay between each typed token in milliseconds.

### delayMap

type: `Array[Object]` default: `none`

Adds additional delay to specific characters before the next character is typed.

```javascript
let delayMap = [
  // increase delay by 100ms at index 4
  { at: 4, delay: 100 },
  // increase delay by 400ms following every '.' character
  { at: '.', delay: 400 },
  // decrease delay by 200ms following every '!' character
  { at: /!/, delay: -200 }
]
```

### initialDelay

type: `Number` default: `200`

The time in milliseconds before the first token is typed.

### onTyped

type: `Function` default: `none`

A callback called when each token is typed or erased during the animation. The
function is called with two arguments:
`(String token, Number previousVisibleCharacters)`.

### onTypingEnd

type: `Function` default: `none`

Called once the typing animation has completed. This callback is **not** called
if `props.typing` is changed to `0` before the animation completes.

## License

Released under the MIT license. See [LICENSE](LICENSE) for details.

[React Native]: https://facebook.github.io/react-native/
[react-typewriter]: https://github.com/ianbjorndilling/react-typewriter
