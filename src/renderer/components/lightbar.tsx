import { StyleSheet, css } from 'aphrodite';
import { useState } from 'react';
import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyleLightbar = currentTheme.getComponentStyle('lightbar');
const componentStyleLightbarItem =
  currentTheme.getComponentStyle('lightbaritem');

export const lightbarStyle = StyleSheet.create({
  lightbar: {},

  vertical: {
    display: 'inline-flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  horizontal: {
    display: 'inline-flex',
    flexDirection: 'row',
    height: '100%',
    width: '100%',
  },
  left: {
    left: 0,
    top: 0,
    borderRadius: '0 5px 5px 0px',
  },
  right: {
    position: 'absolute',
    right: 0,
    top: 0,
    borderRadius: '0px 5px',
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    borderRadius: '0px 0px 5px 5px',
  },
  lightbarItem: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    flexGrow: 1,
  },
  lightbarItemBeforeHorizontal: {
    margin: '0px 1px',
  },
  before: {},
  lightbarItemBeforeVertical: {
    margin: '1% 0px 1% 0px',
  },
  ...componentStyleLightbar,
}) as any;

const SidebarItem = ({
  pageValue = 1 as number,
  pageDisplay = String(pageValue) as string,
  doublePage = false as boolean,
  isSelected = false as boolean,
  isVertical = false as boolean,
  isRight = false as boolean,
  isTooSmall = false as boolean,
  isSmall = false as boolean,
  forceShow = false as boolean,
  onClick = (() => {}) as (pageNumber: number) => void,
}) => {
  const Colour = `221,4,38`;
  const selectedStylesheet = StyleSheet.create({
    itemGradient: {
      backgroundImage: isSelected
        ? `linear-gradient(to ${
            isVertical ? (isRight ? 'right' : 'left') : 'bottom'
          }, rgba(${
            isSelected ? '255,255,255' : '0,0,0'
          },0) 0%,rgba(255,255,255,0.25) 100%)`
        : 'rgba(0,0,0,255)',
      zIndex: 1,
      transition:
        'opacity 0.2s ease-in-out, top 0.2s ease-in-out, left 0.2s ease-in-out, right 0.2s ease-in-out, bottom 0.2s ease-in-out',
      position: 'relative',
      top: !isVertical
        ? isSelected
          ? '-8px'
          : forceShow
          ? '0px'
          : '12px'
        : '0px',
      left: isVertical // why am i such an awful programmer?
        ? isSelected
          ? isRight
            ? '-8px'
            : '8px'
          : forceShow
          ? '0px'
          : isRight
          ? '12px'
          : '-12px'
        : '0px',
      opacity: isSelected ? 1 : forceShow ? 1 : 0,
      '::before': {
        content: `""`, // this makes sure that if there are too many pages, the text is not shown
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0,
        transition:
          'top 0.5s ease-in-out, left 0.5s ease-in-out, right 0.5s ease-in-out, bottom 0.5s ease-in-out, opacity 0.5s ease-in-out',
        zIndex: -1,
        backgroundImage: `linear-gradient(to ${
          isVertical ? (isRight ? 'right' : 'left') : 'bottom'
        }, rgba(0,0,0,0) 0%,rgba(${Colour},0.25) 100%)`,
      },
      ':hover': {
        transform: 'scale(1.05), translateY(-15px)',
        [isVertical ? (isRight ? 'left' : 'right') : 'top']: '-8px',
        '::before': {
          opacity: 1,
        },
      },
    },
    bar: {
      height: isVertical ? '100%' : '3px',
      width: isVertical ? '3px' : '100%',
      position: 'absolute',
      backgroundColor: isSelected ? themeColors.accent : themeColors.white,
      [`${isVertical ? (isRight ? 'right' : 'left') : 'bottom'}`]: isVertical
        ? '0%'
        : '8%',
      [`${isVertical ? 'top' : ''}`]: 0,
    },
    pageNumber: {
      top: isVertical ? '0' : '50%',
      left: doublePage ? '0' : isVertical && !isRight ? '0' : '50%',
      bottom: 0,
      right: isVertical && isRight ? '0' : '50%',
      [isVertical ? 'height' : 'width']: doublePage ? '100%' : 'unset',
      [`${isVertical ? (isRight ? 'right' : 'left') : 'bottom'}`]: '65%',
      textAlign: isVertical ? (isRight ? 'right' : 'left') : 'center',
      position: 'absolute',
      verticalAlign: 'middle',
      fontSize: '0.625em',
      fontFamily: '"Roboto", sans-serif',
      fontWeight: 'bolder',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      userFocus: 'none',
      userInput: 'none',
      'user-select': 'none',
      color: themeColors.white,
    },
    ...componentStyleLightbarItem,
  }) as any;
  const showText = !isTooSmall ? (
    <span className={css(selectedStylesheet.pageNumber)}>{pageDisplay}</span>
  ) : null;
  return (
    <button
      type="button"
      className={css(
        selectedStylesheet.itemGradient,
        !isSmall
          ? isVertical
            ? lightbarStyle.lightbarItemBeforeVertical
            : lightbarStyle.lightbarItemBeforeHorizontal
          : null,
        lightbarStyle.lightbarItem
      )}
      onContextMenuCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={() => {
        onClick(pageValue);
      }}
    >
      {showText}
      <div className={css(selectedStylesheet.bar)} />
    </button>
  );
};

const Lightbar = ({
  disabled = false,
  isVertical = false,
  isRight = false,
  Page = 1,
  outOf = 16,
  isRightToLeft = true,
  doublePageDisplay = false,
  onItemClick = (() => {}) as (pageNumber: number) => void,
}) => {
  const [isHover, setHover] = useState(false);
  const pageCalculation =
    outOf / (document.getElementById('root') as HTMLElement).offsetWidth;

  const items = [];
  for (let i = 0; i < outOf; doublePageDisplay ? (i += 2) : i++) {
    const iteration = isRightToLeft
      ? outOf - i - (outOf % 2 === 0 && doublePageDisplay ? 2 : 1)
      : i;
    // If doublePageDisplay is true and the page count is an even number, then
    items.push(
      <SidebarItem
        pageValue={iteration + 1}
        doublePage={doublePageDisplay}
        pageDisplay={String(
          // If doublePageDisplay is true and there is a page after the current page, then display "P1 - P2"; otherwise just P1.
          // If doublePageDisplay is false, then display P1.
          doublePageDisplay && iteration + 2 <= outOf
            ? `${iteration + 1} - ${iteration + 2}`
            : iteration + 1
        )}
        isSmall={pageCalculation >= 1 / 32}
        isTooSmall={pageCalculation >= 1 / 8}
        isSelected={Page - 1 === iteration}
        forceShow={isHover}
        isVertical={isVertical}
        isRight={isRight}
        onClick={onItemClick}
        key={i}
      />
    );
  }

  const containerSpecificStylesheet = StyleSheet.create({
    horizontal: {
      backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.45) 65%,rgba(0,0,0,0) 100%)`,
    },
    verticalL: {
      backgroundImage: `linear-gradient(to left, rgba(0,0,0,0) 0%,rgba(0,0,0,0.35) 100%)`,
    },
    verticalR: {
      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0) 0%,rgba(0,0,0,0.35) 100%)`,
    },
    container: {
      position: 'absolute',
      width: isVertical ? '5%' : '100%',
      top: isVertical ? '0' : 'unset',
      [isVertical ? (isRight ? 'right' : 'left') : 'bottom']: '0',
      height: isVertical ? '95%' : '5%',
      marginTop: isVertical ? '1%' : '0%',
      display: 'flex',
      alignItems: 'center',
      zIndex: 1290,
    },
  });

  const containerData = isVertical
    ? isRight
      ? containerSpecificStylesheet.verticalR
      : containerSpecificStylesheet.verticalL
    : containerSpecificStylesheet.horizontal;

  return disabled ? null : (
    <div
      className={css(containerSpecificStylesheet.container)}
      onContextMenuCapture={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      <div
        className={css(
          containerData,
          isVertical ? lightbarStyle.vertical : lightbarStyle.horizontal,
          isVertical
            ? isRight
              ? lightbarStyle.right
              : lightbarStyle.left
            : lightbarStyle.bottom,
          lightbarStyle.lightbar
        )}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
        }}
      >
        {items}
      </div>
    </div>
  );
};

export default Lightbar;
