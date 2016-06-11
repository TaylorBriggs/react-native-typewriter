'use strict'

import React, {
  Component,
  Text,
  PropTypes
} from 'react-native'

const MAX_DELAY = 100
const TYPING_VALS = [-1, 0, 1]
const INITIAL_STATE = { visibleChars: 0 }

function isEqual (current, next) {
  return current === next
}

export default class TypeWriter extends Component {
  constructor (props) {
    super(props)

    this.state = INITIAL_STATE

    this._setNextState = this._setNextState.bind(this)
  }

  componentDidMount () {
    this._start()
  }

  componentWillUnmount () {
    this._clearTimeout()
  }

  componentWillReceiveProps (nextProps) {
    const active = this.props.typing
    const next = nextProps.typing

    if (next === 0) {
      this._clearTimeout()
    } else if (!isEqual(active, next)) {
      this._setNextState(next)
    } else if (!isEqual(nextProps.children, this.props.children)) {
      this.setState(INITIAL_STATE)
      this._start()
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    return (
      !isEqual(this.state.visibleChars, nextState.visibleChars) ||
      !isEqual(this.props.children, nextProps.children)
    )
  }

  componentDidUpdate (prevProps, prevState) {
    const {
      children,
      delayMap,
      onTyped,
      onTypingEnd
    } = this.props
    const {visibleChars} = prevState
    const currentToken = children[visibleChars]
    const nextToken = children[this.state.visibleChars]

    if (currentToken && onTyped) {
      onTyped(currentToken, visibleChars)
    }

    if (nextToken) {
      let timeout = this._getRandomTimeout()

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

  render () {
    const {children, ...props} = this.props
    const {visibleChars} = this.state

    return (
      <Text {...props}>
        {children.slice(0, visibleChars)}
      </Text>
    )
  }

  _start (timeout = this.props.initialDelay) {
    this._clearTimeout()
    this._timeoutId = setTimeout(this._setNextState, timeout)
  }

  _clearTimeout () {
    if (this._timeoutId) {
      clearTimeout(this._timeoutId)
    }
  }

  _setNextState (typing = this.props.typing) {
    this.setState({ visibleChars: this.state.visibleChars + typing })
  }

  _getRandomTimeout () {
    const {maxDelay, minDelay} = this.props

    return Math.round(Math.random() * (maxDelay - minDelay) + minDelay)
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
  children: PropTypes.string.isRequired,
  typing: PropTypes.oneOf(TYPING_VALS),
  maxDelay: PropTypes.number,
  minDelay: PropTypes.number,
  initialDelay: PropTypes.number,
  delayMap: PropTypes.arrayOf(delayShape),
  onTyped: PropTypes.func,
  onTypingEnd: PropTypes.func
}

TypeWriter.defaultProps = {
  initialDelay: MAX_DELAY * 2,
  maxDelay: MAX_DELAY,
  minDelay: MAX_DELAY / 5,
  typing: TYPING_VALS[1]
}
