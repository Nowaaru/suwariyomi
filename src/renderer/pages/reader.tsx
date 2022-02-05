import { StyleSheet, css } from 'aphrodite';
import { useRef } from 'react';
import { URLSearchParams } from 'url';

import Handler from '../../sources/handler';
import Sidebar from '../components/sidebar';
import useQuery from '../util/hook/usequery';
import SourceBase from '../../sources/static/base';

const Style = StyleSheet.create({
  container: {
    display: 'block',
    position: 'absolute',
    width: '100vw',
    height: 'calc(100vh - 42px)',
  },
  sidebar: {
    display: 'block',
    top: '0px',
    left: '0px',
    width: '200px',
    height: '100%',
    backgroundColor: '#312F2F',
  },
});

const Reader = () => {
  const queryParameters = useQuery();
  const {
    source: sourceId = 'MangaDex',
    id: mangaId = '',
    chapter: chapterId = '',
    page: pageNumber = '1',
  } = Object.fromEntries(queryParameters as unknown as URLSearchParams);

  let selectedSource;
  {
    const mappedFileNamesRef = useRef<SourceBase[]>(
      window.electron.util
        .getSourceFiles()
        .map(Handler.getSource)
        .filter((x) => x.getName().toLowerCase() === sourceId.toLowerCase())
    );
    // selectedSource = mappedFileNamesRef.current[0];
    ({ 0: selectedSource } = mappedFileNamesRef.current);
  }

  console.log(
    `chapterId: ${chapterId} || mangaId: ${mangaId} || pageNumber: ${pageNumber}`
  );

  return (
    <div className={css(Style.container)}>
      <Sidebar outOf={32} />
    </div>
  );
};

export default Reader;
