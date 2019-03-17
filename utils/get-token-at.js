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

    while (childIndex < length) {
      child = children[childIndex];

      if (typeof child !== 'string') {
        return findToken(child);
      }

      if (innerIndex - child.length < 0) {
        return child.charAt(innerIndex);
      }

      innerIndex -= child.length;
      childIndex += 1;
    }

    return undefined;
  }

  return findToken(component);
}
