import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, ViewPropTypes } from 'react-native';

const Delay = PropTypes.shape({
  at: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(RegExp)
  ]),
  delay: PropTypes.number
});

const DIRECTIONS = [-1, 0, 1];
const MAX_DELAY = 100;

export default class TypeWriter extends Component {
  static propTypes = {
    children: PropTypes.string.isRequired,
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
    if (props.typing !== state.direction) {
      return { direction: props.typing };
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
    this.clearTimeout();

    const { typing } = this.props;

    if (prevProps.typing !== typing) {
      if (typing === 0) return;

      if (typing === -1) {
        this.typeNextChar();
        this.startTyping(this.getRandomTimeout());
        return;
      }
    }

    const {
      children,
      delayMap,
      onTyped,
      onTypingEnd
    } = this.props;
    const { visibleChars } = this.state;
    const currentToken = children[prevState.visibleChars];
    const nextToken = children[visibleChars];

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

  renderInvisibleString(fixed, children) {
    const { visibleChars } = this.state;

    if (!fixed) return null;

    return (
      <Text style={{ opacity: 0 }}>
        {children.slice(visibleChars)}
      </Text>
    );
  }

  renderVisibleString(children) {
    const { visibleChars } = this.state;

    return children.slice(0, visibleChars);
  }

  render() {
    const { fixed, children, ...props } = this.props;

    return (
      <Text {...props}>
        {this.renderVisibleString(children)}
        {this.renderInvisibleString(fixed, children)}
      </Text>
    );
  }
}
