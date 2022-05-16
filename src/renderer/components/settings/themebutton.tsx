import { StyleSheet, css } from 'aphrodite';
import Theme from '../../../main/util/theme';
import type { ThemeType } from '../../index';

const {
  theme: themeStyle,
  themeStyleDark,
  themeStyleLight,
} = window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  themeStyle === 'dark' ? themeStyleDark : themeStyleLight,
  themeStyle as 'dark' | 'light'
);

// eslint-disable-next-line @typescript-eslint/naming-convention
const _TC = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('themebutton');

const styles = StyleSheet.create({
  themeButtonContainer: {
    width: '150px',
    height: '200px',
    marginBottom: '40px',
    marginRight: '20px',
  },

  themeButton: {
    width: '100%',
    height: '200px',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    marginBottom: '8px',
    cursor: 'pointer',
  },

  themeButtonDisplay: {
    width: '100%',
    height: '100%',
    borderStyle: 'solid',
    borderRadius: '4px',
  },

  themeTitle: {
    fontSize: '16px',
    fontWeight: 300,
    fontFamily: 'Poppins',
    textAlign: 'center',
  },

  ...componentStyle,
}) as any;

type ThemeButtonProps = {
  theme: ThemeType['metadata'];
  variant: 'light' | 'dark';
  selected?: boolean;
  onClick?: () => void;
};

const ThemeButton = (props: ThemeButtonProps) => {
  const { theme, variant, onClick, selected } = props;
  const themeItem = new Theme(theme.name.toLowerCase(), variant);

  const newThemeColours = themeItem.getColors();
  console.log(selected);

  return (
    <div className={css(styles.themeButtonContainer)}>
      <button
        onClick={onClick}
        type="button"
        className={css(styles.themeButton)}
      >
        <div
          className={css(styles.themeButtonDisplay)}
          style={{
            backgroundColor: newThemeColours.background,
            borderWidth: selected ? '2px' : '1px',
            borderColor: selected
              ? newThemeColours.accent
              : newThemeColours.white,
          }}
        >
          <div
            // Topbar
            style={{
              backgroundColor: 'transparent',
              padding: '4px 4px',
              boxSizing: 'border-box',
              width: '100%',
              height: '20px',
              display: 'flex',
            }}
          >
            <div
              style={{
                borderRadius: '50%',
                width: '12px',
                height: '12px',
                backgroundColor: '#FFFFFF',
              }}
            />

            <div
              style={{
                marginTop: '5px',
                marginLeft: '3px',
                borderRadius: '5px',
                width: '24px',
                height: '6px',
                backgroundColor: '#FFFFFF',
              }}
            />

            {['#A51A1A', '#B4AA1D', '#1AAA1A'].map((color, idx) => (
              <div
                style={{
                  marginTop: '4px',
                  marginLeft: idx !== 0 ? '3px' : '75px',
                  borderRadius: '50%',
                  width: '6px',
                  height: '6px',
                  backgroundColor: color,
                }}
              />
            ))}
          </div>

          <div
            style={{
              position: 'relative',
              display: 'flex',
              top: '8px',
              left: '8px',
            }}
          >
            <div
              style={{
                backgroundColor: newThemeColours.backgroundDark,
                position: 'relative',
                width: '32px',
                height: '32px',
              }}
            />

            <div
              style={{
                backgroundColor: newThemeColours.backgroundDark,
                position: 'relative',
                padding: '4px',
                left: '8px',
                width: '92px',
                height: '32px',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ display: 'flex' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '75%',
                    height: '8px',
                    backgroundColor: newThemeColours.white,
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    marginLeft: '2px',
                    width: '25%',
                    height: '8px',
                    backgroundColor: newThemeColours.accent,
                  }}
                />
              </div>
              <div style={{ display: 'flex', marginTop: '2px' }}>
                <div
                  style={{
                    position: 'relative',
                    width: '25%',
                    height: '4px',
                    backgroundColor: newThemeColours.white,
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    marginLeft: '2px',
                    width: '15%',
                    height: '4px',
                    backgroundColor: newThemeColours.accent,
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    marginLeft: '2px',
                    width: '25%',
                    height: '4px',
                    backgroundColor: newThemeColours.white,
                  }}
                />
              </div>
            </div>
          </div>
          <div
            style={{
              position: 'relative',
              width: '94%',
              height: '80px',
              top: '16px',
              left: '4px',
              backgroundColor: newThemeColours.backgroundDark,
              boxShadow: `0px 0px 4px ${newThemeColours.black.substring(
                0,
                7
              )}CC`,
            }}
          >
            <div
              style={{
                display: 'flex',
                padding: '4px',
                boxSizing: 'border-box',
              }}
            >
              <div
                style={{
                  backgroundColor: newThemeColours.accent,
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                }}
              />

              <div
                style={{
                  position: 'relative',
                  marginLeft: '2px',
                  top: '2px',
                  width: '25%',
                  height: '4px',
                  backgroundColor: newThemeColours.white,
                }}
              />
              <div
                style={{
                  position: 'relative',
                  marginLeft: '12px',
                  top: '2px',
                  width: '10%',
                  height: '4px',
                  backgroundColor: newThemeColours.white,
                }}
              />

              <div
                style={{
                  backgroundColor: newThemeColours.accent,
                  width: '2px',
                  marginTop: '3px',
                  height: '2px',
                  borderRadius: '50%',
                  marginLeft: '10px',
                }}
              />

              <div
                style={{
                  position: 'relative',
                  marginLeft: '1px',
                  top: '2px',
                  width: '15%',
                  height: '4px',
                  backgroundColor: newThemeColours.white,
                }}
              />

              {[1, 2, 3, 4].map((i) => (
                <div
                  style={{
                    backgroundColor:
                      i === 4 ? newThemeColours.white : newThemeColours.accent,
                    width: '2px',
                    marginTop: '3px',
                    height: '2px',
                    borderRadius: '50%',
                    marginLeft: i === 1 ? '12px' : '4px',
                  }}
                />
              ))}
            </div>

            {[1, 2].map(() => (
              <div
                style={{
                  display: 'flex',
                  marginBottom: '8px',
                  paddingLeft: '4px',
                  boxSizing: 'border-box',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    backgroundColor: newThemeColours.accent,
                    width: '12px',
                    height: '25px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    backgroundColor: newThemeColours.accentSpecial,
                    width: '20px',
                    marginLeft: '4px',
                    height: '4px',

                    borderRadius: '1.5px',
                    top: '85%',
                    right: '10px',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    backgroundColor: newThemeColours.accent2,
                    width: '20px',
                    marginLeft: '4px',
                    height: '4px',

                    borderRadius: '1.5px',
                    top: '60%',
                    right: '10px',
                  }}
                />
                <div
                  style={{
                    width: '100%',
                  }}
                >
                  <div
                    style={{
                      backgroundColor: newThemeColours.white,
                      width: '60%',
                      marginLeft: '4px',
                      height: '5px',
                    }}
                  />
                  <div
                    style={{
                      backgroundColor: newThemeColours.white,
                      width: '20%',
                      marginLeft: '4px',
                      marginTop: '1px',
                      height: '3px',
                    }}
                  />

                  <div
                    style={{
                      backgroundColor: newThemeColours.white,
                      width: '40%',
                      marginLeft: '4px',
                      marginTop: '6px',
                      height: '2px',
                    }}
                  />
                  <div
                    style={{
                      backgroundColor: newThemeColours.white,
                      width: '35%',
                      marginLeft: '4px',
                      marginTop: '1px',
                      height: '2px',
                    }}
                  />
                  <div
                    style={{
                      backgroundColor: newThemeColours.white,
                      width: '35%',
                      marginLeft: '4px',
                      marginTop: '1px',
                      height: '2px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div
            style={{
              position: 'relative',
              marginLeft: '12px',
              top: '25px',
              left: '18%',
              width: '50%',
              height: '1px',
              background: `radial-gradient(
                circle,
                  ${newThemeColours.white} 15%,
                  transparent 85%
                )`,
            }}
          />

          <div
            style={{
              position: 'relative',
              marginLeft: '12px',
              top: '29px',
              left: '18%',
              width: '50%',
              height: '4px',
              backgroundColor: newThemeColours.white,
            }}
          />

          <div
            style={{
              position: 'relative',
              marginLeft: '12px',
              top: '32px',
              left: '20%',
              width: '30%',
              height: '2px',
              backgroundColor: newThemeColours.white,
            }}
          />

          <div
            style={{
              position: 'relative',
              marginLeft: '12px',
              top: '30px',
              left: '52%',
              width: '13%',
              height: '2px',
              backgroundColor: newThemeColours.accent,
            }}
          />
        </div>
      </button>
      <div
        className={css(styles.themeTitle)}
        style={{
          color: _TC.white,
        }}
      >
        {theme.name}
      </div>
    </div>
  );
};

ThemeButton.defaultProps = {
  onClick: () => {},
  selected: false,
};

export default ThemeButton;
