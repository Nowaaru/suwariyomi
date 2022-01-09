import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
  container: {
    display: 'block',
    paddingTop: '42px',
  },
  searchbar: {
    width: '25%',
  },
});
const SearchPage = () => {
  return (
    <div className={css(styles.container)}>
      <div className={css(styles.searchbar)}>
        {/* <SearchBar placeholder="Search manga..." /> */}
      </div>
    </div>
  );
};

export default SearchPage;
