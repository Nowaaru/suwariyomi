import { Tooltip } from '@mui/material';
import { StyleSheet, css } from 'aphrodite';
import { useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';

import Tabs from '../components/tabs';
import Button from '../components/button';
import type { SourceMetadata } from '../index';
import { clearRequireCache } from '../../shared/util';

const styles = StyleSheet.create({
  container: { marginLeft: '75px', height: '90%' },
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
    border: '1px solid #DF2935',
  },
  tags: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: 'fit-content',
  },
  tag: {
    color: '#FFFFFF33',
    fontFamily: 'Poppins',
    fontSize: '10px',
    border: '1px solid #FFFFFF33',
    borderRadius: '4px',
    padding: '2px',
    marginRight: '4px',
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
    fontWeight: 500,
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
  notfoundcontainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
  },
  installeddisclaimer: {
    fontSize: '12px',
    color: '#FFFFFF55',
    fontFamily: 'Poppins',
    lineHeight: '1',
    display: 'flex',
  },
  to: {
    color: '#95AC67',
    fontWeight: 800,
  },
  backButton: {},
  backButtonContainer: {
    display: 'flex',
    marginLeft: '-50px',
    marginTop: '10px',
  },
});

const HeaderLine = ({ label }: { label: string }) => (
  <div className={css(styles.headerline)}>
    <div className={css(styles.headerline_label)}>{label}</div>
    <div className={css(styles.headerline_divider)} />
  </div>
);

type SourceMetadataWithUpdater = (SourceMetadata & {
  needsUpdate?: boolean;
  isObsolete?: boolean;
})[];
const Sources = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [installed, setInstalled] = useState<SourceMetadataWithUpdater>(
    window.electron.util.getSourceMetadata()
  );

  const showInstalled = currentTab === 0;
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
  }, [installed, currentTab]);

  const serializedMetadata: SourceMetadataWithUpdater = useMemo(() => {
    const sourceMetadata = window.electron.util
      .getSourceMetadata()
      .map((source) => {
        // Compare the old and new source metadata to see if the source has been
        // updated. If updated, mark with the 'needsUpdate' flag.

        const onlineSource: SourceMetadata | undefined = allSourceData.find(
          (installedSource) => installedSource.name === source.name
        );

        if (onlineSource) {
          if (onlineSource.version !== source.version) {
            (source as SourceMetadataWithUpdater[number]).needsUpdate = true;
          }
        } else (source as SourceMetadataWithUpdater[number]).isObsolete = true;

        return source;
      });

    return sourceMetadata;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [installed, allSourceData]);

  useEffect(() => {
    const { on, off } = window.electron.ipcRenderer;
    const onFN = () => {
      const Metadata = window.electron.util.getSourceMetadata();
      setInstalled(Metadata);
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
      <div className={css(styles.backButtonContainer)}>
        <Link
          to="/"
          style={{
            textDecoration: 'none',
          }}
        >
          <Button
            className={css(styles.backButton)}
            tooltipTitle="Back"
            tooltipPlacement="bottom"
            label="Back"
          />
        </Link>
      </div>
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
      {(showInstalled ? installed : allSourceData).length > 0 ? (
        Object.keys(Object.fromEntries(allLanguageGroups))
          .filter((lang) => (allLanguageGroups.get(lang)?.length ?? 0) > 0)
          .map((lang) => (
            <>
              <HeaderLine
                label={
                  languageNames.of(lang) !== lang
                    ? languageNames.of(lang)!
                    : `Unknown (${lang})`
                }
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
                      currentTab !== 0 ||
                      installed.some((x) => x.name === y.name)
                  )
                  .map((source) => {
                    const localSource = serializedMetadata.find(
                      (x) => x.name === source.name
                    );

                    const isInstalled = !!localSource;
                    return (
                      <div
                        key={source.name}
                        className={css(styles.itemcontainer)}
                      >
                        <div className={css(styles.iconcontainer)}>
                          <img
                            src={source.icon}
                            className={css(styles.itemicon)}
                            alt={`${source.name} Icon`}
                          />
                        </div>
                        <div className={css(styles.metacontainer)}>
                          <div className={css(styles.titlecontainer)}>
                            <span className={css(styles.title)}>
                              {source.name}
                            </span>
                            <span className={css(styles.version, styles.at)}>
                              @
                            </span>
                            <span className={css(styles.version)}>
                              {(showInstalled
                                ? localSource
                                : source
                              )?.version.replace(/^@/, '')}
                            </span>
                            {showInstalled && localSource?.needsUpdate ? (
                              <span className={css(styles.version, styles.to)}>
                                {' > '}
                                {source.version}
                              </span>
                            ) : null}
                          </div>
                          <div className={css(styles.tags)}>
                            <Tooltip
                              title={
                                source.nsfw
                                  ? 'The content this source can provide may be inappropriate to show to minors.'
                                  : ''
                              }
                            >
                              <span
                                className={css(
                                  styles.tag,
                                  source.nsfw && styles.r18
                                )}
                              >
                                {source.nsfw ? 'NSFW' : 'SAFE'}
                              </span>
                            </Tooltip>
                            {showInstalled && localSource?.isObsolete ? (
                              <Tooltip title="This source is unsupported. Things may break, and you will not be able to reinstall it if uninstalled.">
                                <span className={css(styles.tag)}>
                                  OBSOLETE
                                </span>
                              </Tooltip>
                            ) : null}
                          </div>
                        </div>
                        <div className={css(styles.installButton)}>
                          <Button
                            onClick={() => {
                              const foundSource = serializedMetadata.find(
                                (installedSource) =>
                                  installedSource.name === source.name
                              );

                              if (foundSource?.path)
                                clearRequireCache(foundSource.path);

                              if (isInstalled && !foundSource?.needsUpdate) {
                                return window.electron.download.removeSource(
                                  foundSource!
                                );
                              }

                              return window.electron.download.downloadSource(
                                source.zip
                              );
                            }}
                            label={
                              isInstalled
                                ? localSource.needsUpdate
                                  ? 'Update'
                                  : 'Uninstall'
                                : 'Install'
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          ))
      ) : (
        <div className={css(styles.notfoundcontainer)}>
          <span className={css(styles.installeddisclaimer)}>{`${
            showInstalled ? "You've no sources." : null
          }`}</span>
        </div>
      )}
    </div>
  );
};

export default Sources;
