import React from 'react';
import { StyleSheet, css } from 'aphrodite';
// class Library extends React.Component {
//   constructor() {
//     super();
//     this.state = {

//   }
// }

const libraryStyleSheet = StyleSheet.create({
  container: {
    display: 'block',
    position: 'absolute',
    width: '100vw',
    height: 'calc(100vh - 42px)',
  },
  searchbarContainer: {
    width: '100%',
    height: '56px',
  },
});
const Library = () => {
  return (
    <div className={css(libraryStyleSheet.container)}>
      <div className={css(libraryStyleSheet.searchbarContainer)}>
        <input type="text" />
      </div>
    </div>
  );
};

export default Library;
