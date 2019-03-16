import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, ViewPropTypes } from 'react-native';
import { getTokenAt, hideSubstring } from '../utils';

const Delay = PropTypes.shape({
  at: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(RegExp)
  ]),
  delay: PropTypes.number
});

const DIRECTIONS = [-1, 0, 1];
const DISPLAY_NONE = { style: { display: 'none' } };
const HIDE_COLOR = { color: 'transparent' };
const MAX_DELAY = 100;

export default class TypeWriter extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    delayMap: PropTypes.arrayOf(Delay),
    fixed: PropTypes.bool,
    initialDelay: PropTypes.number,
    maxDelay: PropTypes.number,
    minDelay: PropTypes.number,
    onTyped: PropTypes.func,
    onTypingEnd: PropTypes.func,
    style: ViewPropTypes.style,
    typing: PropTypes.oneOf(DIRECTIONS)
  };

  static defaultProps = {
    fixed: false,
    initialDelay: MAX_DELAY * 2,
    maxDelay: MAX_DELAY,
    minDelay: MAX_DELAY / 5,
    onTyped() {},
    onTypingEnd() {},
    style: {},
    typing: 0
  };

  static getDerivedStateFromProps(props, state) {
    const { typing } = props;

    if (typing !== state.direction) {
      return { direction: typing, visibleChars: state.visibleChars + typing };
    }

    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      direction: props.typing,
      visibleChars: 0
    };

    this.typeNextChar = this.typeNextChar.bind(this);
  }

  componentDidMount() {
    const { initialDelay } = this.props;

    this.startTyping(initialDelay);
  }

  componentDidUpdate(prevProps, prevState) {
    const { typing } = this.props;

    this.clearTimeout();

    if (typing === 0) return;

    const {
      delayMap,
      onTyped,
      onTypingEnd
    } = this.props;
    const { visibleChars } = this.state;
    const currentToken = getTokenAt(this, prevState.visibleChars);
    const nextToken = getTokenAt(this, visibleChars);

    if (currentToken) {
      onTyped(currentToken, visibleChars);
    }

    if (nextToken) {
      let timeout = this.getRandomTimeout();

      if (delayMap) {
        delayMap.forEach(({ at, delay }) => {
          if (at === visibleChars || currentToken.match(at)) {
            timeout += delay;
          }
        });
      }

      this.startTyping(timeout);
    }

    if (!nextToken) {
      onTypingEnd();
    }
  }

  componentWillUnmount() {
    this.clearTimeout();
  }

  getRandomTimeout() {
    const { maxDelay, minDelay } = this.props;

    return Math.round(Math.random() * (maxDelay - minDelay) + minDelay);
  }

  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  startTyping(delay) {
    this.timeoutId = setTimeout(this.typeNextChar, delay);
  }

  typeNextChar() {
    this.setState(({ direction, visibleChars }) => ({
      visibleChars: visibleChars + direction
    }));
  }

  render() {
    const {
      children,
      delayMap,
      fixed,
      initialDelay,
      maxDelay,
      minDelay,
      onTyped,
      onTypingEnd,
      typing,
      ...rest
    } = this.props;
    const { visibleChars } = this.state;
    const hideProps = fixed ? HIDE_COLOR : DISPLAY_NONE;
    const component = (
      <Text {...rest}>
        {children}
      </Text>
    );

    return hideSubstring(component, hideProps, visibleChars);
  }
}
