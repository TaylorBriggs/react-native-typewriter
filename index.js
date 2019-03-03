import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, ViewPropTypes } from 'react-native';

const delayShape = PropTypes.shape({
  at: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
    PropTypes.instanceOf(RegExp)
  ]),
  delay: PropTypes.number
});

const propTypes = {
  children: PropTypes.string.isRequired,
  fixed: PropTypes.bool,
  typing: PropTypes.oneOf([-1, 0, 1]),
  maxDelay: PropTypes.number,
  minDelay: PropTypes.number,
  initialDelay: PropTypes.number,
  delayMap: PropTypes.arrayOf(delayShape),
  onTyped: PropTypes.func,
  onTypingEnd: PropTypes.func,
  style: ViewPropTypes.style
};

const MAX_DELAY = 100;

const defaultProps = {
  initialDelay: MAX_DELAY * 2,
  maxDelay: MAX_DELAY,
  minDelay: MAX_DELAY / 5,
  typing: 0,
  fixed: false,
  style: {}
};

const isEqual = (current, next) => current === next;

class TypeWriter extends Component {
  constructor(props) {
    super(props);

    this.state = { visibleChars: 0 };

    this.setNextState = this.setNextState.bind(this);
  }

  componentDidMount() {
    this.start();
  }

  componentWillReceiveProps(nextProps) {
    const { children, typing: current } = this.props;
    const { typing: next } = nextProps;

    if (next === 0) {
      this.clearTimeout();
    } else if (!isEqual(current, next)) {
      this.setNextState(next);
    } else if (!isEqual(children, nextProps.children)) {
      this.setState({ visibleChars: 0 });
      this.start();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const { children } = this.props;
    const { visibleChars } = this.state;

    return (
      !isEqual(visibleChars, nextState.visibleChars)
      || !isEqual(children, nextProps.children)
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      children,
      delayMap,
      onTyped,
      onTypingEnd
    } = this.props;
    const { visibleChars: visible } = this.state;
    const { visibleChars } = prevState;
    const currentToken = children[visibleChars];
    const nextToken = children[visible];

    if (currentToken && onTyped) {
      onTyped(currentToken, visibleChars);
    }

    if (nextToken) {
      let timeout = this.getRandomTimeout();

      if (delayMap) {
        delayMap.forEach(({ at, delay }) => {
          if (isEqual(at, visibleChars) || currentToken.match(at)) {
            timeout += delay;
          }
        });
      }

      this.start(timeout);
    } else if (onTypingEnd) {
      onTypingEnd();
    }
  }

  componentWillUnmount() {
    this.clearTimeout();
  }

  setNextState(typing) {
    const { typing: defaultTyping } = this.props;

    this.setState(({ visibleChars }) => ({
      visibleChars: visibleChars + (typing || defaultTyping)
    }));
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

  start(timeout) {
    const { initialDelay } = this.props;

    this.clearTimeout();
    this.timeoutId = setTimeout(this.setNextState, (timeout || initialDelay));
  }

  render() {
    const { fixed, children, ...props } = this.props;
    const { visibleChars } = this.state;

    const visibleString = children.slice(0, visibleChars);

    const components = [(
      <Text
        {...props}
        key="visible-string"
      >
        {visibleString}
      </Text>
    )];

    if (fixed) {
      const invisibleString = children.slice(visibleChars);
      const invisibleStyle = { opacity: 0 };

      components.push(
        <Text
          {...props}
          style={[props.style, invisibleStyle]}
          key="invisible-string"
        >
          {invisibleString}
        </Text>
      );
    }

    return <Text>{components}</Text>;
  }
}

TypeWriter.propTypes = propTypes;
TypeWriter.defaultProps = defaultProps;

export default TypeWriter;
