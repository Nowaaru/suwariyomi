import { StyleSheet, css } from 'aphrodite';

type TagColour =
  | 'normal'
  | 'pornographic'
  | 'suggestive'
  | 'erotica'
  | 'doujinshi'
  | 'anthology';

type TagProps = {
  name: string;
  type: TagColour;
};

const Tag = (props: TagProps) => {
  /*
    Later Functionality:
      When the Tag is clicked, the App will automatically start a search query for that source and tag.
  */

  const { name, type } = props;
  const tagColours = {
    normal: '#272727',
    pornographic: '#DF2935',
    suggestive: '#FDCA40',
    anthology: '#3772FF',
    doujinshi: '8B4E9A',
    erotica: '#EE7A3B',
  };

  const styles = StyleSheet.create({
    tag: {
      display: 'inline-block',
      padding: '2px 5px',
      margin: '0px',
      marginRight: '10px',
      borderRadius: '5px',
      backgroundColor: tagColours[type],
      color: '#fff',
      fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    },
  });

  return <div className={css(styles.tag)}>{name}</div>;
};

export default Tag;
