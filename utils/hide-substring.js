import React, { Children } from 'react';
import { Text } from 'react-native';

export default function hideSubstring(component, hideProps = {}, start, end) {
  let index = 0;
  let endIndex;
  let startIndex;

  if (start > end) {
    endIndex = start;
    startIndex = end;
  } else {
    endIndex = end;
    startIndex = start || 0;
  }

  function cloneWithHiddenSubstrings(element) {
    const { children } = element.props;

    if (children) {
      /* eslint-disable-next-line no-use-before-define */
      return React.cloneElement(element, {}, Children.map(children, hide));
    }

    return element;
  }

  function hide(child) {
    if (typeof child !== 'string') {
      return cloneWithHiddenSubstrings(child);
    }

    const strEnd = child.length + index;
    let styled = null;

    if (strEnd > startIndex && (!endIndex || index < endIndex)) {
      const relStartIndex = startIndex - index;
      const relEndIndex = endIndex ? (endIndex - index) : strEnd;
      const leftSubstring = child.substring(0, relStartIndex);
      const rightSubstring = child.substring(relEndIndex, strEnd);
      const styledString = (
        <Text {...hideProps}>
          {child.substring(relStartIndex, relEndIndex)}
        </Text>
      );

      styled = [leftSubstring, styledString, rightSubstring];
    }

    index = strEnd;

    return styled || child;
  }

  return cloneWithHiddenSubstrings(component);
}
