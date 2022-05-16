import { StyleSheet, css } from 'aphrodite';
import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('tag');

type TagColour = string;
type TagProps = {
  name: string;
  color?: TagColour;
};

const styles = StyleSheet.create({
  tag: {
    display: 'inline-block',
    padding: '2px 5px',
    margin: '0px',
    marginRight: '10px',
    marginBottom: '5px',
    borderRadius: '5px',
    backgroundColor: themeColors.tag ?? '#272727',
    color: themeColors.textLight,
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});
const Tag = ({ name, color }: TagProps) => {
  /*
    Later Functionality:
      When the Tag is clicked, the App will automatically start a search query for that source and tag.
  */

  return (
    <div
      className={css(styles.tag)}
      style={{
        backgroundColor: color,
        ...componentStyle,
      }}
    >
      {name}
    </div>
  );
};

Tag.defaultProps = {
  color: '',
};

export default Tag;
