import React, { Children } from 'react';
import { StyleSheet, Text } from 'react-native';

const styles = StyleSheet.create({
  hidden: { color: 'transparent' }
});

export default function hideSubstring(component, fixed, start, end) {
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
    let newChild = null;

    if (strEnd > startIndex && (!endIndex || index < endIndex)) {
      const relStartIndex = startIndex - index;
      const leftSubstring = child.substring(0, relStartIndex);
      const relEndIndex = endIndex ? (endIndex - index) : strEnd;
      const rightSubstring = child.substring(relEndIndex, strEnd);

      if (fixed) {
        const styledString = (
          <Text style={styles.hidden}>
            {child.substring(relStartIndex, relEndIndex)}
          </Text>
        );

        newChild = [leftSubstring, styledString, rightSubstring];
      } else {
        newChild = [leftSubstring, rightSubstring];
      }
    }

    index = strEnd;

    return newChild || child;
  }

  return cloneWithHiddenSubstrings(component);
}
