import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
  container: {
    display: 'block',
  },
  searchbar: {},
});

const SearchBar = ({
  placeholder = 'Search' as string,
  className = '' as string,
}) => {
  return (
    <div className={css(styles.container)}>
      <input
        className={`${css(styles.searchbar)} ${className}`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default SearchBar;
