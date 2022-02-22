import '../css/Login.css';
import { StyleSheet, css } from 'aphrodite';
import { useNavigate } from 'react-router-dom';

import anilist from '../../../assets/icons/login/anilist/transparent.png';
import myanimelist from '../../../assets/icons/login/myanimelist/transparent.png';

import LoginItem from '../components/loginitem';

const onAuth = () => {
  const submitButton = document.getElementById('submit');
  if (submitButton) submitButton.innerText = 'Continue';
};

const LoginMenu = () => {
  const { checkAuthenticated } = window.electron.auth;
  const navigate = useNavigate();
  const styleSheet = StyleSheet.create({
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
    button: {
      width: '100%',
      height: '50px',
      background: 'rgb(14, 14, 14)',
      border: '2px solid rgb(14, 14, 14)',
      borderRadius: '8px',
      color: 'rgb(255, 255, 255)',
      fontSize: '1.2em',
      fontFamily: "'PT Sans Narrow', sans-serif",
      fontWeight: 'bold',
      marginTop: '10px',
      cursor: 'pointer',
      position: 'relative',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
    },
  });
  if (window.electron.store.get('skipped_auth')) navigate('/library');

  const submitButton = (
    <button
      type="button"
      id="submit"
      onClick={() => {
        if (!checkAuthenticated)
          window.electron.store.set('skipped_auth', true);
        navigate('/library');
      }}
      className={css(styleSheet.button)}
    >
      {checkAuthenticated() ? 'Continue' : `I'll skip for now.`}
    </button>
  );
  return (
    <div id="login-container">
      <div id="login-container-inner">
        <div id="login-container-inner-inner">
          <h1>Login</h1>
          <hr className="rule" />
          <div className="login-content">
            <div className="login-content-inner">
              <div className="icons">
                <LoginItem
                  src={anilist}
                  isDisabled={!!checkAuthenticated('anilist')}
                  onAuth={onAuth}
                  disabledtitle="Already logged in!"
                  authenticator="anilist"
                  alt="Login with AniList"
                />
                <LoginItem
                  src={myanimelist}
                  isDisabled={!!checkAuthenticated('myanimelist')}
                  onAuth={onAuth}
                  disabledtitle="Already logged in!"
                  authenticator="myanimelist"
                  alt="Login with MyAnimeList"
                />
              </div>
            </div>
            {submitButton}
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  return (
    <div className="login-main">
      <LoginMenu />
      <div id="login-background" />
    </div>
  );
};

export default Login;
