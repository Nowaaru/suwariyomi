import React from 'react';
import { Tooltip } from '@mui/material';
import { StyleSheet, css } from 'aphrodite';

// TODO: Unionize this
const AniListIntegrationHandler = async () => {
  window.electron.auth
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
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          nodeIntegrationInWorker: false,
          nodeIntegrationInSubFrames: false,
        },
      },
      'https://anilist.co/api/v2/oauth/authorize?client_id=7246&response_type=token'
    )
    .then((returnData) => {
      if (!returnData) return false;

      const previousAuthorization =
        window.electron.store.get('authorization') || {};
      previousAuthorization.anilist = returnData;
      window.electron.store.set('authorization', previousAuthorization);

      return true;
    })
    .catch(console.error);
};

const MyAnimeListIntegrationHandler = async () => {
  const Authentication = {} as any;
  const PKCE = await window.electron.auth.generatePKCE();
  const authorizationURL = Authentication.getOAuthUrl(PKCE.code_challenge);
  return window.electron.auth
    .generateAuthenticationWindow(
      {
        width: 400,
        height: 600,
        center: true,
        maximizable: false,
        minimizable: false,
        resizable: false,
        title: 'MyAnimeList Login',
        darkTheme: true,
        backgroundColor: '#111',
        webPreferences: { contextIsolation: false },
      },
      authorizationURL
    )
    .then((returnData) => {
      if (!returnData) return false;
      const previousAuthorization = window.electron.store.get('authorization');
      previousAuthorization.myanimelist = returnData;

      window.electron.store.set('authorization', previousAuthorization);
      return true;
    });
};

const styles = StyleSheet.create({
  isDisabled: {
    filter: 'grayscale(0.25) brightness(25%)',
  },
  loginItem: {
    transition: 'filter 1s linear',
    display: 'flex',
    width: '64px',
    height: '64px',
    background: 'rgb(14, 14, 14)',
    border: '2px solid rgb(14, 14, 14)',
    borderRadius: '100%',
    marginRight: '10px',
    marginBottom: '10px',
    cursor: 'pointer',

    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    width: '100%',
    height: '100%',
  },
});

// const LoginItem = ({
//   src = '',
//   alt = 'Login Item' as string,
//   title = 'Login Item' as string,
//   disabledtitle = 'Already logged in!' as string,
//   isDisabled = false as boolean,
//   onClick = (() => {}) as () => void,
// }) => {
//   return (
//     <Tooltip title={isDisabled ? disabledtitle : alt || title} placement="top">
//       <span>
//         <button
//           disabled={isDisabled}
//           type="button"
//           onClick={onClick}
//           className={`login-item ${css(styles.loginItem)}`}
//         >
//           <img
//             src={src}
//             alt={alt}
//             title={title || alt}
//             className={css(styles.img, isDisabled ? styles.isDisabled : false)}
//           />
//         </button>
//       </span>
//     </Tooltip>
//   );
// };

type ComponentProps = {
  src?: string;
  alt?: string;
  title?: string;
  disabledtitle?: string;
  isDisabled?: boolean;
  authenticator: 'anilist' | 'myanimelist';
  onAuth?: () => void;
};

const Authenticators = {
  anilist: AniListIntegrationHandler,
  myanimelist: MyAnimeListIntegrationHandler,
};

class LoginItem extends React.Component<ComponentProps, ComponentProps> {
  constructor(props: ComponentProps) {
    super(props);

    this.state = this.props;
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick = async () => {
    const { authenticator } = this.props;
    return Authenticators[authenticator]().then(() => {
      this.setState({ isDisabled: true });
      return true;
    });
  };

  render() {
    const {
      src = '',
      alt = 'Login Item' as string,
      title = 'Login Item' as string,
      disabledtitle = 'Already logged in!' as string,
      isDisabled = false as boolean,
      onAuth = (() => {}) as () => void,
    } = this.state;

    const { handleClick } = this;
    return (
      <Tooltip
        title={isDisabled ? disabledtitle : alt || title}
        placement="top"
      >
        <span>
          <button
            disabled={isDisabled}
            type="button"
            onClick={() => {
              return handleClick().then(() => {
                return onAuth();
              });
            }}
            className={`login-item ${css(styles.loginItem)}`}
          >
            <img
              src={src}
              alt=""
              className={css(
                styles.img,
                isDisabled ? styles.isDisabled : false
              )}
            />
          </button>
        </span>
      </Tooltip>
    );
  }
}

export default LoginItem;
