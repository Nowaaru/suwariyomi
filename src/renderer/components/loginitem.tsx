/* eslint-disable react/sort-comp */
import { useCallback, useMemo, useState } from 'react';
import { Tooltip } from '@mui/material';
import { StyleSheet, css } from 'aphrodite';
import { SupportedTrackers, getTracker } from '../util/tracker/tracker';
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
      returnData.expires_in = Date.now() + returnData.expires_in * 1000;

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
  greyedOut: {
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
    marginTop: '10px',
    marginRight: '10px',
    marginBottom: '10px',
    cursor: 'pointer',

    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  img: {
    maxWidth: '100%',
    maxHeight: '100%',
  },
});

type ComponentProps = {
  title?: string;
  authenticator: SupportedTrackers;
  trackedtitle?: string;
  onAuth?: () => void;
  onDeauth?: () => void;
};

const Authenticators = {
  AniList: AniListIntegrationHandler,
  MyAnimeList: MyAnimeListIntegrationHandler,
};

const LoginItem = ({
  title,
  authenticator,
  trackedtitle,
  onAuth,
  onDeauth,
}: ComponentProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    window.electron.auth.checkAuthenticated(authenticator)
  );

  const Tracker = useMemo(() => getTracker(authenticator), [authenticator]);
  const handleClick = useCallback(async () => {
    await Authenticators[authenticator]();
    return true;
  }, [authenticator]);

  if (!Tracker)
    throw new Error(`Tracker support for ${authenticator} does not exist.`);
  const displayTitle = (isAuthenticated ? trackedtitle : title) ?? '';
  return (
    <Tooltip title={displayTitle} placement="top">
      <button
        type="button"
        onClick={() => {
          if (isAuthenticated) {
            window.electron.auth.deleteAuthenticated(authenticator);
            setIsAuthenticated(false);
            if (onDeauth) return onDeauth();
          }

          return handleClick()
            .then(() => {
              setIsAuthenticated(true);
              if (onAuth) return onAuth();
            })
            .catch(console.error);
        }}
        className={`${css(styles.loginItem)}`}
      >
        <img
          src={new Tracker().getIcon()}
          alt=""
          className={css(styles.img, isAuthenticated && styles.greyedOut)}
        />
      </button>
    </Tooltip>
  );
};

LoginItem.defaultProps = {
  onAuth: () => {},
  onDeauth: () => {},
  trackedtitle: '',
  title: '',
};

// class LoginItem extends React.Component<ComponentProps, ComponentProps> {
//   constructor(props: ComponentProps) {
//     super(props);
//     const { authenticator } = this.props;
//     const Tracker = getTracker(authenticator);

//     this.tracker = new Tracker();
//     this.handleClick = this.handleClick.bind(this);
//   }

//   handleClick = async () => {
//     const { authenticator } = this.props;
//     return Authenticators[authenticator]();
//   };

//   render() {
//     const {
//       title = 'Authenticate' as string,
//       trackedtitle = 'Click to unauthenticate.',
//       onAuth = (() => {}) as () => void,
//       onDeauth = (() => {}) as () => void,
//       authenticator,
//     } = this.props;

//     const { handleClick } = this;
//     if (!this.tracker)
//       throw new Error(`Tracker support for ${authenticator} does not exist.`);

//     let isAuthenticated =
//       window.electron.auth.checkAuthenticated(authenticator);
//     return (
//       <Tooltip title={isAuthenticated ? trackedtitle : title} placement="top">
//         <button
//           type="button"
//           onClick={() => {
//             if (isAuthenticated) {
//               window.electron.auth.deleteAuthenticated(authenticator);
//               isAuthenticated = false;
//               return onDeauth();
//             }

//             return handleClick()
//               .then(() => {
//                 isAuthenticated = true;
//                 return onAuth();
//               })
//               .catch(console.error);
//           }}
//           className={`${css(styles.loginItem)}`}
//         >
//           <img
//             src={this.tracker.getIcon()}
//             alt=""
//             className={css(styles.img, isAuthenticated && styles.greyedOut)}
//           />
//         </button>
//       </Tooltip>
//     );
//   }

//   tracker: TrackerBase;
// }

export default LoginItem;
