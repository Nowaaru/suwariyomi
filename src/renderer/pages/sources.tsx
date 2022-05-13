import { StyleSheet, css } from 'aphrodite';
import { isEqual } from 'lodash';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

import Tabs from '../components/tabs';
import Button from '../components/button';
import type { SourceMetadata } from '../index';

const styles = StyleSheet.create({
  container: { marginLeft: '75px' },
  installedcontainer: {
    display: 'flex',
    flexDirection: 'column',
    background: '#00000044',
    marginTop: '8px',
    width: '65%',
    height: '57px',
    padding: '8px',
    marginLeft: '25px',
    boxSizing: 'border-box',
    borderRadius: '4px',
    color: 'white',
    fontFamily: 'monospace',
    verticalAlign: 'middle',
    alignContent: 'center',
  },
  itemcontainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  itemicon: {
    maxHeight: '32px',
    maxWidth: '32px',
  },
  headerline: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '0px 12px',
    boxSizing: 'border-box',
    height: '36px',
    margin: '0',
    width: '100%',
  },
  headerline_label: {
    fontSize: '14px',
    color: '#FFFFFF55',
    fontFamily: 'Poppins',
    letterSpacing: '0.5px',
    lineHeight: 3,
    height: 'fit-content',
    marginBottom: '-50px',
    padding: '0',
  },
  headerline_divider: {
    height: '1px',
    background:
      'linear-gradient(to right, #FFFFFF00 0%,  #FFFFFF55 10%, #FFFFFF00)',
    width: '65%',
  },
  r18: {
    color: '#DF2935',
    fontFamily: 'Poppins',
    fontSize: '10px',
    border: '1px solid #DF2935',
    borderRadius: '4px',
    padding: '2px',
  },
  safe: {
    color: '#FFFFFF33',
    fontFamily: 'Poppins',
    fontSize: '10px',
    border: '1px solid #FFFFFF33',
    borderRadius: '4px',
    padding: '2px',
  },
  titlecontainer: {
    marginBottom: '4px',
  },
  title: {
    fontSize: '14px',
  },
  version: {
    fontSize: '9px',
    color: '#DF2935',
    fontWeight: 'bold',
    fontFamily: 'Poppins',
    lineHeight: '1',
  },
  at: {
    fontSize: '16px',
  },
  metacontainer: {
    flexGrow: 2,
  },
  iconcontainer: {
    width: '32px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
  },
  installButton: {
    float: 'right',
  },
});

const HeaderLine = ({ label }: { label: string }) => (
  <div className={css(styles.headerline)}>
    <div className={css(styles.headerline_label)}>{label}</div>
    <div className={css(styles.headerline_divider)} />
  </div>
);

type SourceMetadataWithUpdater = (SourceMetadata & { needsUpdate?: boolean })[];
const Sources = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [installed, setInstalled] = useState(
    window.electron.util.getSourceMetadata()
  );

  const languageNames = new Intl.DisplayNames(['en'], { type: 'language' });
  const { current: allSourceData } = useRef(
    window.electron.util.getSourceCatalogue()
  ); // Destructuring `current` since it should not change.
  const allLanguageGroups = useMemo(() => {
    const groups = new Map<string, SourceMetadataWithUpdater>();
    allSourceData.forEach((source) => {
      if (!source.lang) return;
      if (!groups.has(source.lang)) {
        groups.set(source.lang, []);
      }
      groups.get(source.lang)!.push(source);
    });
    return groups;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installed]);

  useEffect(() => {
    const { on, off } = window.electron.ipcRenderer;
    const onFN = () => {
      const sourceMetadata = window.electron.util.getSourceMetadata();
      sourceMetadata.map((source) => {
        // Compare the old and new source metadata to see if the source has been
        // updated. If updated, mark with the 'needsUpdate' flag.

        const foundSource: SourceMetadataWithUpdater[number] | undefined =
          installed.find(
            (installedSource) => installedSource.name === source.name
          );

        if (foundSource) {
          if (!isEqual(foundSource, source)) {
            foundSource.needsUpdate = true;
          }
        }

        return foundSource;
      });
      setInstalled(sourceMetadata);
    };

    on('source-update', onFN);
    on('source-remove', onFN);
    return () => {
      off('source-update', onFN);
      off('source-remove', onFN);
    };
  });

  return (
    <div className={css(styles.container)}>
      <Tabs
        selectedIndex={currentTab}
        onChange={setCurrentTab}
        tabs={[
          {
            label: 'Installed',
          },
          {
            label: 'All',
          },
        ]}
      />
      {Object.keys(Object.fromEntries(allLanguageGroups)).map((lang) => (
        <>
          <HeaderLine
            label={languageNames.of(lang) ?? `Unknown (${lang})`}
            key={`${lang}-label`}
          />
          <div
            key={`${lang}-container`}
            className={css(styles.installedcontainer)}
          >
            {allLanguageGroups
              .get(lang)!
              .filter(
                (y) =>
                  currentTab !== 0 || installed.some((x) => x.name === y.name)
              )
              .map((source) => {
                const isInstalled = installed.some(
                  (x) => x.name === source.name
                );
                return (
                  <div key={source.name} className={css(styles.itemcontainer)}>
                    <div className={css(styles.iconcontainer)}>
                      <img
                        src={source.icon}
                        className={css(styles.itemicon)}
                        alt={`${source.name} Icon`}
                      />
                    </div>
                    <div className={css(styles.metacontainer)}>
                      <div className={css(styles.titlecontainer)}>
                        <span className={css(styles.title)}>{source.name}</span>
                        <span className={css(styles.version, styles.at)}>
                          @
                        </span>
                        <span className={css(styles.version)}>
                          {source.version.replace(/^@/, '')}
                        </span>
                      </div>
                      <span
                        className={css(source.nsfw ? styles.r18 : styles.safe)}
                      >
                        {source.nsfw ? 'NSFW' : 'SAFE'}
                      </span>
                    </div>
                    <div className={css(styles.installButton)}>
                      <Button
                        onClick={() => {
                          if (isInstalled && !source.needsUpdate) {
                            const foundSource = installed.find(
                              (installedSource) =>
                                installedSource.name === source.name
                            );

                            if (!foundSource) return;
                            return window.electron.download.removeSource(
                              foundSource
                            );
                          }
                          return window.electron.download.downloadSource(
                            source.zip
                          );
                        }}
                        label={
                          isInstalled
                            ? 'Uninstall'
                            : source.needsUpdate
                            ? 'Update'
                            : 'Install'
                        }
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      ))}
    </div>
  );
};

export default Sources;
