import { StyleSheet, css } from 'aphrodite';
import { Link } from 'react-router-dom';

const StylesNotFound = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: '#312F2F',
  },
  title: {
    color: '#FFFFFF',
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  text: {
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
});

const Page404 = () => {
  return (
    <div className={css(StylesNotFound.container)}>
      <h1 className={css(StylesNotFound.title)}>404</h1>
      <h3 className={css(StylesNotFound.subtitle)}>
        I think we&apos;re lost...
      </h3>
      <p>
        How about we go <Link to="/library">back home?</Link>
      </p>
    </div>
  );
};

export default Page404;
