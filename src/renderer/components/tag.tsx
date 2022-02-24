import { StyleSheet, css } from 'aphrodite';

type TagColour = string;
type TagProps = {
  name: string;

  // color is automatically filled in if not provided
  // eslint-disable-next-line react/require-default-props
  color?: TagColour;
};

const Tag = ({ name, color = '#272727' }: TagProps) => {
  /*
    Later Functionality:
      When the Tag is clicked, the App will automatically start a search query for that source and tag.
  */

  const styles = StyleSheet.create({
    tag: {
      display: 'inline-block',
      padding: '2px 5px',
      margin: '0px',
      marginRight: '10px',
      marginBottom: '5px',
      borderRadius: '5px',
      backgroundColor: color,
      color: '#fff',
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  return <div className={css(styles.tag)}>{name}</div>;
};

export default Tag;
