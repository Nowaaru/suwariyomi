// https://itnext.io/improving-slow-mounts-in-react-apps-cff5117696dc
import { useState, Children, useEffect, useMemo, ReactElement } from 'react';

const Defer = ({
  chunkSize,
  children,
}: {
  chunkSize: number;
  children: JSX.Element[];
}) => {
  const [renderedItemsCount, setRenderedItemsCount] = useState(chunkSize);
  const childrenArray = useMemo(() => Children.toArray(children), [children]);

  useEffect(() => {
    if (renderedItemsCount < childrenArray.length) {
      window.requestIdleCallback(
        () => {
          setRenderedItemsCount(
            Math.min(renderedItemsCount + chunkSize, childrenArray.length)
          );
        },
        { timeout: 200 }
      );
    }
  }, [renderedItemsCount, childrenArray.length, chunkSize]);

  return childrenArray.slice(
    0,
    renderedItemsCount
  ) as unknown as ReactElement[];
};

export default Defer;
