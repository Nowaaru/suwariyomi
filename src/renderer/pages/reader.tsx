import { StyleSheet, css } from 'aphrodite';
import Sidebar from '../components/sidebar';

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
  return (
    <div className={css(Style.container)}>
      <Sidebar outOf={32} />
    </div>
  );
};

export default Reader;
