import React, { Component } from "react";
import PropTypes from "prop-types";
import { Text } from "react-native";
import {
  getTokenAt,
  hideSubstring,
  getNewDelayMap,
  extractTextFromChildren,
} from "../utils";

const DIRECTIONS = [-1, 0, 1];
const MAX_DELAY = 100;

export default class TypeWriter extends Component {
  static propTypes = {
    children: PropTypes.node.isRequired,
    delayMap: PropTypes.arrayOf(
      PropTypes.shape({
        at: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.instanceOf(RegExp),
        ]),
        delay: PropTypes.number,
      })
    ),
    fixed: PropTypes.bool,
    initialDelay: PropTypes.number,
    maxDelay: PropTypes.number,
    minDelay: PropTypes.number,
    onTyped: PropTypes.func,
    onTypingEnd: PropTypes.func,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
    typing: PropTypes.oneOf(DIRECTIONS),
  };

  static defaultProps = {
    fixed: false,
    initialDelay: 0,
    maxDelay: MAX_DELAY,
    minDelay: MAX_DELAY / 5,
    onTyped() {},
    onTypingEnd() {},
    style: {},
    typing: 0,
  };

  static getDerivedStateFromProps(props, state) {
    const { typing } = props;
    const { direction, visibleChars } = state;

    if (typing !== direction) {
      return { direction: typing, visibleChars: visibleChars + typing };
    }

    return null;
  }

  constructor(props) {
    super(props);

    this.state = {
      direction: props.typing,
      visibleChars: 0,
    };

    const oldDelayMap = props.delayMap || [];
    this.delayMap = getNewDelayMap(oldDelayMap, props.children);
    this.typeNextChar = this.typeNextChar.bind(this);
  }

  componentDidMount() {
    const { initialDelay } = this.props;

    this.startTyping(initialDelay);
  }

  componentDidUpdate(prevProps, prevState) {
    const { children, typing } = this.props;

    if (this.halted) return;

    this.clearTimeout();
    if (typing === 0) return;

    if (
      children !== prevProps.children &&
      extractTextFromChildren(children) !==
        extractTextFromChildren(prevProps.children)
    ) {
      this.delayMap = getNewDelayMap(this.delayMap, children);
      this.reset();
      return;
    }

    const { onTyped, onTypingEnd } = this.props;
    const { visibleChars } = this.state;
    const currentToken = getTokenAt(this, prevState.visibleChars);
    const nextToken = getTokenAt(this, visibleChars);

    if (currentToken) {
      onTyped(currentToken, visibleChars);
    }

    if (nextToken) {
      let timeout = this.getRandomTimeout();

      if (this.delayMap) {
        this.delayMap.forEach(({ at, delay }) => {
          if (currentToken && at === visibleChars) {
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

    return maxDelay;
  }

  clearTimeout() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  reset() {
    const { initialDelay } = this.props;
    this.setState({ visibleChars: 0 }, () => this.startTyping(initialDelay));
  }

  startTyping(delay) {
    this.halted = true;
    this.timeoutId = setTimeout(() => {
      this.halted = false;
      this.typeNextChar();
    }, delay);
  }

  typeNextChar() {
    this.setState(({ direction, visibleChars }) => ({
      visibleChars: visibleChars + direction,
    }));
  }

  render() {
    const {
      children,
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
    const component = <Text {...rest}>{children}</Text>;

    return hideSubstring(component, fixed, visibleChars);
  }
}
