import { Text } from 'react-native';
import React from 'react';

const MAX_DELAY = 100;
const TYPING_VALS = [-1, 0, 1];
const INITIAL_STATE = {
  visibleChars: 0
};

function isEqual(current, next) {
  return current === next;
}

export default class TypeWriter extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
    this.setNextState = this.setNextState.bind(this);
  }

  componentDidMount() {
    this.start();
  }

  componentWillReceiveProps(nextProps) {
    const active = this.props.typing;
    const next = nextProps.typing;

    if (next === 0) {
      this.clearTimeout();
    } else if (!isEqual(active, next)) {
      this.setNextState(next);
    } else if (!isEqual(nextProps.children, this.props.children)) {
      this.setState(INITIAL_STATE);
      this.start();
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      !isEqual(this.state.visibleChars, nextState.visibleChars) ||
      !isEqual(this.props.children, nextProps.children)
    );
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      children,
      delayMap,
      onTyped,
      onTypingEnd
    } = this.props;
    const { visibleChars } = prevState;
    const currentToken = children[visibleChars];
    const nextToken = children[this.state.visibleChars];

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


  setNextState(typing = this.props.typing) {
    this.setState({ visibleChars: this.state.visibleChars + typing });
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

  start(timeout = this.props.initialDelay) {
    this.clearTimeout();
    this.timeoutId = setTimeout(this.setNextState, timeout);
  }

  render() {
    const { children, ...props } = this.props;
    const { visibleChars } = this.state;

    return (
      <Text {...props}>
        {children.slice(0, visibleChars)}
      </Text>
    );
  }
}

const delayShape = React.PropTypes.shape({
  at: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number,
    React.PropTypes.instanceOf(RegExp)
  ]),
  delay: React.PropTypes.number
});

TypeWriter.propTypes = {
  children: React.PropTypes.string.isRequired,
  typing: React.PropTypes.oneOf(TYPING_VALS),
  maxDelay: React.PropTypes.number,
  minDelay: React.PropTypes.number,
  initialDelay: React.PropTypes.number,
  delayMap: React.PropTypes.arrayOf(delayShape),
  onTyped: React.PropTypes.func,
  onTypingEnd: React.PropTypes.func
};

TypeWriter.defaultProps = {
  initialDelay: MAX_DELAY * 2,
  maxDelay: MAX_DELAY,
  minDelay: MAX_DELAY / 5,
  typing: TYPING_VALS[1]
};
