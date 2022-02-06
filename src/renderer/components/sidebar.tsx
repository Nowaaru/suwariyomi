import { StyleSheet, css } from 'aphrodite';
import { useRef } from 'react';

export const sidebarStyle = StyleSheet.create({
  sidebar: {
    opacity: 0, // this is to make sure that the sidebar is not shown when the page is loaded
    transition: 'opacity 0.5s',
    ':hover': {
      opacity: 1,
    },
  },
  vertical: {
    display: 'inline-flex',
    flexDirection: 'column',
    height: '100%',
    width: '5%',
  },
  horizontal: {
    display: 'inline-flex',
    flexDirection: 'row',
    height: '5%',
    width: '100%',
  },
  left: {
    left: 0,
    top: 0,
  },
  right: {
    position: 'absolute',
    right: 0,
    top: 0,
  },
  bottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  sidebarItem: {
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    flexGrow: 1,
  },
  sidebarItemBeforeHorizontal: {
    margin: '0px 1px',
  },
  before: {},
  sidebarItemBeforeVertical: {
    margin: '1% 0px 1% 0px',
  },
});

const SideBar = ({
  isVertical = false as boolean,
  isRight = false as boolean,
  Page = 1 as number,
  outOf = 16 as number,
}) => {
  const pageCalculation =
    outOf / (document.getElementById('root') as HTMLElement).offsetWidth;
  const isTooSmall = pageCalculation >= 1 / 8;
  const isSmall = pageCalculation >= 1 / 32;
  console.log(pageCalculation);
  const SidebarItem = ({
    pageValue = 1 as number,
    isSelected = false as boolean,
  }) => {
    const Colour = `221,4,38`;
    const selectedStylesheet = useRef(
      StyleSheet.create({
        itemGradient: {
          backgroundImage: isSelected
            ? `linear-gradient(to ${
                isVertical ? (isRight ? 'right' : 'left') : 'bottom'
              }, rgba(${
                isSelected ? '255,255,255' : '0,0,0'
              },0) 0%,rgba(255,255,255,0.25) 100%)`
            : 'rgba(0,0,0,255)',
          zIndex: 1,
          position: 'relative',
          top: isSelected ? '-4px' : 'unset',
          '::before': {
            content: `""`, // this makes sure that if there are too many pages, the text is not shown
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0,
            transition: 'top 0.5s, opacity 0.5s',
            zIndex: -1,
            backgroundImage: `linear-gradient(to ${
              isVertical ? (isRight ? 'right' : 'left') : 'bottom'
            }, rgba(0,0,0,0) 0%,rgba(${Colour},0.25) 100%)`,
          },
          ':hover': {
            transform: 'scale(1.05), translateY(-15px)',
            top: '-4px',
            '::before': {
              opacity: 1,
            },
          },
        },
        bar: {
          height: isVertical ? '100%' : '3px',
          width: isVertical ? '3px' : '100%',
          position: 'absolute',
          backgroundColor: isSelected ? '#F00' : '#FFF',
          [`${isVertical ? (isRight ? 'right' : 'left') : 'bottom'}`]:
            isVertical ? '0%' : '8%',
          [`${isVertical ? 'top' : ''}`]: 0,
        },
        pageNumber: {
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
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
          color: '#FFF',
        },
      })
    );
    const showText = !isTooSmall ? (
      <span className={css(selectedStylesheet.current.pageNumber)}>
        {pageValue}
      </span>
    ) : null;
    return (
      <button
        type="button"
        className={css(
          selectedStylesheet.current.itemGradient,
          !isSmall
            ? isVertical
              ? sidebarStyle.sidebarItemBeforeVertical
              : sidebarStyle.sidebarItemBeforeHorizontal
            : null,
          sidebarStyle.sidebarItem
        )}
        onClick={() => {
          console.log(pageValue);
        }}
      >
        {showText}
        <div className={css(selectedStylesheet.current.bar)} />
      </button>
    );
  };

  const items = [];
  for (let i = 0; i < outOf; i++) {
    items.push(
      <SidebarItem pageValue={i + 1} isSelected={Page - 1 === i} key={i} />
    );
  }

  const containerSpecificStylesheet = StyleSheet.create({
    horizontal: {
      backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0) 0%,rgba(0,0,0,0.35) 100%)`,
    },
    verticalL: {
      backgroundImage: `linear-gradient(to left, rgba(0,0,0,0) 0%,rgba(0,0,0,0.35) 100%)`,
    },
    verticalR: {
      backgroundImage: `linear-gradient(to right, rgba(0,0,0,0) 0%,rgba(0,0,0,0.35) 100%)`,
    },
    container: {
      width: '100%',
      height: isVertical ? '95%' : '100%',
      position: 'absolute',
      marginTop: isVertical ? '1%' : '0%',
      display: 'flex',
      alignItems: 'center',
    },
  });

  const containerData = isVertical
    ? isRight
      ? containerSpecificStylesheet.verticalR
      : containerSpecificStylesheet.verticalL
    : containerSpecificStylesheet.horizontal;
  return (
    <div className={css(containerSpecificStylesheet.container)}>
      <div
        className={css(
          containerData,
          isVertical ? sidebarStyle.vertical : sidebarStyle.horizontal,
          isVertical
            ? isRight
              ? sidebarStyle.right
              : sidebarStyle.left
            : sidebarStyle.bottom,
          sidebarStyle.sidebar
        )}
      >
        {items}
      </div>
    </div>
  );
};

export default SideBar;
