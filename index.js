'use strict'

import React, {
  Component,
  Text,
  PropTypes
} from 'react-native'

const MAX_DELAY = 100
const TYPING_VALS = [-1, 0, 1]
const INITIAL_STATE = { visibleChars: 0 }

function isEqual(current, next) {
  return current === next
}

export default class TypeWriter extends Component {
  constructor(props) {
    super(props)

    this.state = INITIAL_STATE

    this._setNextState = this._setNextState.bind(this)
  }

  componentDidMount() {
    this._start()
  }

  componentWillUnmount() {
    this._stop()
  }

  componentWillReceiveProps(nextProps) {
    const active = this.props.typing
    const next   = nextProps.typing

    if (next === 0) {
      this._stop()
    } else if (!isEqual(active, next)) {
      this._setNextState(next)
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(this.state.visibleChars, nextState.visibleChars) ||
      !isEqual(this.props.text, nextProps.text)
    )
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      text,
      maxDelay,
      minDelay,
      delayMap,
      onTyped,
      onTypingEnd
    } = this.props
    const {visibleChars} = prevState
    const currentToken   = text[visibleChars]
    const nextToken      = text[this.state.visibleChars]

    if (currentToken && onTyped) {
      onTyped(currentToken, visibleChars)
    }

    if (nextToken) {
      let timeout = Math.round(Math.random() * (maxDelay - minDelay) + minDelay)

      if (delayMap) {
        delayMap.forEach(({at, delay}) => {
          if (isEqual(at, visibleChars) || currentToken.match(at)) {
            timeout += delay
          }
        })
      }

      this._start(timeout)
    } else if (onTypingEnd) {
      onTypingEnd()
    }
  }

  render() {
    const {text, ...props} = this.props
    const {visibleChars} = this.state

    return <Text {...props}>{text.slice(0, visibleChars)}</Text>
  }

  _start(timeout = this.props.initialDelay) {
    this._timeoutId = setTimeout(this._setNextState, timeout)
  }

  _stop() {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId)
    }
  }

  _setNextState(typing = this.props.typing) {
    this.setState({ visibleChars: this.state.visibleChars + typing })
  }
}

const delayShape = PropTypes.shape({
  at: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(RegExp)
  ]),
  delay: PropTypes.number
})

TypeWriter.propTypes = {
  text:         PropTypes.string.isRequired,
  typing:       PropTypes.oneOf(TYPING_VALS),
  maxDelay:     PropTypes.number,
  minDelay:     PropTypes.number,
  initialDelay: PropTypes.number,
  delayMap:     PropTypes.arrayOf(delayShape),
  onTyped:      PropTypes.func,
  onTypingEnd:  PropTypes.func
}

TypeWriter.defaultProps = {
  text:         '',
  initialDelay: MAX_DELAY * 2,
  maxDelay:     MAX_DELAY,
  minDelay:     MAX_DELAY / 5,
  typing:       TYPING_VALS[1]
}
