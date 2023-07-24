import extractTextFromChildren from './extract-text-from-children';

export default function getNewDelayMap(oldDelayMap, children) {
  const newDelayMap = [];
  const str = extractTextFromChildren(children);

  for (const delayObj of oldDelayMap) {
    if (typeof delayObj.at === 'number') {
      newDelayMap.push(delayObj);
    }
    else if (typeof delayObj.at === 'string' || delayObj.at instanceof RegExp) {
      const matches = str.matchAll(delayObj.at);
      for (const match of matches) {
        const endIndex= match.index + match[0].length;
        const isAlreadySet = newDelayMap.filter((obj) => obj.at === endIndex).length > 0;
        if (!isAlreadySet) {
          newDelayMap.push({ at: endIndex, delay: delayObj.delay });
        }
      }
    } 
  }
  return newDelayMap;
}
