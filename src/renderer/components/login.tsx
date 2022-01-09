import '../css/Login.css';
import OwlCarousel from 'react-owl-carousel';
import { StyleSheet } from 'aphrodite';
import { Component } from 'react';
import { slideInDown } from 'react-animations';

import thumbnails from '../../../assets/data/thumbnail.json';
import anilist from '../../../assets/icons/login/anilist/transparent.png';
import myanimelist from '../../../assets/icons/login/myanimelist/transparent.png';

import 'owl.carousel/dist/assets/owl.carousel.css';
import 'owl.carousel/dist/assets/owl.theme.default.css';
import LoginItem from './loginitem';

class LoginMenu extends Component {
  styleSheet = StyleSheet.create({
    slideOut: {
      animationName: slideInDown,
      animationDuration: '1s',
    },
    buttonStateLogin: {
      top: '15%',
    },
    invisible: {
      visibility: 'hidden',
    },
    windowStateActive: {
      maxHeight: '85%',
      height: '300px',
    },
  });

  constructor(props: { [k: string]: any }) {
    super(props);

    this.state = {};
  }

  render() {
    return (
      <div id="login-container">
        <div id="login-container-inner">
          <div id="login-container-inner-inner">
            <h1>Login</h1>
            <hr className="rule" />
            <div className="login-content">
              <div className="login-content-inner">
                <div className="icons">
                  <LoginItem src={anilist} alt="Login with AniList" />
                  <LoginItem
                    src={myanimelist}
                    isDisabled={
                      !!window.electron.store.get('authorization_anilist')
                    }
                    disabledtitle="Already logged in!"
                    onClick={() => {
                      window.electron.ipcRenderer
                        .generateAuthenticationWindow(
                          {
                            width: 400,
                            height: 600,
                            center: true,
                            maximizable: false,
                            minimizable: false,
                            resizable: false,
                            title: 'AniList Login',
                            darkTheme: true,
                            backgroundColor: '#111',
                            webPreferences: { contextIsolation: false },
                          },
                          'https://anilist.co/api/v2/oauth/authorize?client_id=7246&response_type=token'
                        )
                        .then((returnData) => {
                          window.electron.store.set(
                            'authorization_anilist',
                            returnData
                          );

                          return true;
                        })
                        .catch(console.error);
                    }}
                    alt="Login with MyAnimeList"
                  />
                </div>
              </div>
              <button type="button" id="submit">
                I&apos;ll skip for now.
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const Login = () => {
  /* Get all thumbnails and array-ify them */
  const thumbnailsArray = thumbnails.data.Page.mediaList;
  const elementArray: Array<JSX.Element> = [];
  const carouselArray: Array<JSX.Element> = [];
  thumbnailsArray.forEach(({ media }) => {
    if (!media.coverImage.color) return;

    elementArray.push(
      <div className="background-item" key={media.coverImage.extraLarge}>
        <img
          src={media.coverImage.extraLarge}
          key={`${media.coverImage.extraLarge}-image`}
          alt=""
        />
      </div>
    );
  });

  for (let i = 0; i < 4; i += 1) {
    const owlCarousel = (
      <OwlCarousel
        className={`owl-carousel-${i}`}
        dots={false}
        mouseDrag={false}
        loop
        autoplay
        items={16}
        autoplaySpeed={6000}
        smartSpeed={6000}
        center
        seamless
        margin={0}
        key={`owl-carousel-${i}`}
      >
        {elementArray}
      </OwlCarousel>
    );
    carouselArray.push(
      <div className="carousel-item" key={i}>
        <div className="carousel-item-inner" key={i}>
          {owlCarousel}
        </div>
      </div>
    );
  }

  return (
    <div className="login-main">
      <LoginMenu />
      <div id="login-background">{/* carouselArray */}</div>
    </div>
  );
};

export default Login;
