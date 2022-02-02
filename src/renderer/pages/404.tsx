import { StyleSheet, css } from 'aphrodite';
import { Link } from 'react-router-dom';
import Particles from 'react-tsparticles';

const StylesNotFound = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    fontFamily: '"Roboto", sans-serif',
  },
  title: {
    color: '#FFFFFF',
    fontSize: '48px',
    fontWeight: 'bold',
    marginBottom: '-15px',
    fontFamily: 'Poppins',
    zIndex: 3,
  },
  subtitle: {
    color: '#FFFFFF',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '-10px',
    zIndex: 3,
    fontFamily: '"Open Sans", Roboto, Poppins, sans-serif',
  },
  text: {
    color: '#FFFFFF',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
    zIndex: 3,
    fontFamily: '"Open Sans", Roboto, Poppins, sans-serif',
  },
  backgroundDim: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: '#000000',
    opacity: 0.8,
    zIndex: 2,
  },
  link: {
    color: '#DF2935',
    letterSpacing: 'unset',
    transition: 'all 0.3s ease-in-out',
    ':hover': {
      color: '#E04550',
      letterSpacing: '1px',
    },
  },
});

const Page404 = () => {
  return (
    <div className={css(StylesNotFound.container)}>
      <Particles
        style={{
          zIndex: '-2',
        }}
        options={{
          fpsLimit: 60,
          interactivity: {
            detectsOn: 'canvas',
            events: {
              onClick: {
                enable: true,
                mode: 'push',
              },
              onHover: {
                enable: true,
                mode: 'repulse',
              },
              resize: true,
            },
            modes: {
              push: {
                quantity: 4,
              },
              repulse: {
                distance: 10,
                duration: 5,
              },
            },
          },
          particles: {
            color: {
              value: '#FFFFFF',
            },
            links: {
              color: '#FFFFFF',
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            collisions: {
              enable: false,
            },
            move: {
              direction: 'none',
              enable: true,
              outMode: 'bounce',
              random: true,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                value_area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: 'circle',
            },
            size: {
              random: true,
              value: 2,
            },
          },
          detectRetina: true,
        }}
      />
      <div className={css(StylesNotFound.container)}>
        <div
          className={css(
            StylesNotFound.backgroundDim,
            StylesNotFound.container
          )}
        />
        <h1 className={css(StylesNotFound.title)}>404</h1>
        <h3 className={css(StylesNotFound.subtitle)}>
          I think we&apos;re lost...
        </h3>
        <p className={css(StylesNotFound.text)}>
          How about we go{' '}
          <Link to="/library" className={css(StylesNotFound.link)}>
            back home?
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Page404;
