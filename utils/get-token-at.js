import { Children } from 'react';

export default function getTokenAt(component, index) {
  if (index < 0) {
    return undefined;
  }

  let innerIndex = index;

  function findToken(element) {
    const children = Children.toArray(element.props.children);
    const { length } = children;
    let childIndex = 0;
    let child;
    let token;

    while (!token && childIndex < length) {
      child = children[childIndex];

      if (typeof child !== 'string') {
        token = findToken(child);
      } else if (innerIndex - child.length < 0) {
        token = child.charAt(innerIndex);
      } else {
        innerIndex -= child.length;
      }

      childIndex += 1;
    }

    return token;
  }

  return findToken(component);
}
