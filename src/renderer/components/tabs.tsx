import { Tabs as MuiTabs, Tab } from '@mui/material';
import {
  useCallback,
  useState,
  JSXElementConstructor,
  ReactElement,
} from 'react';
import { StyleSheet, css } from 'aphrodite';

import Theme from '../../main/util/theme';

const { theme, themeStyleDark, themeStyleLight } =
  window.electron.settings.getAll().appearance;

const currentTheme = new Theme(
  theme === 'dark' ? themeStyleDark : themeStyleLight,
  theme as 'dark' | 'light'
);

const themeColors = currentTheme.getColors();
const componentStyle = currentTheme.getComponentStyle('tabs');

const styles = StyleSheet.create({
  tabs: {
    marginBottom: '12px',
  },

  tab: {
    color: themeColors.textLight,
    marginRight: '12px',
    padding: '6px',
    boxSizing: 'border-box',
    width: '165px',
    height: '36px',
    borderRight: 1,
    borderColor: themeColors.accent,
  },

  ...componentStyle,
}) as any;

type Element = ReactElement<any, string | JSXElementConstructor<any>>;
type TabsProps = {
  tabs: Array<{
    label: string;
    icon?: Element;
  }>;
  onChange?: (index: number) => void;
  selectedIndex?: number;
};

const Tabs = ({ tabs, onChange, selectedIndex: defaultIndex }: TabsProps) => {
  const [selectedIndex, setSelectedIndex] = useState(defaultIndex ?? 0);

  const handleChange = useCallback(
    (event: React.ChangeEvent<unknown>, index: number) => {
      setSelectedIndex(index);
      onChange?.(index);
    },
    [setSelectedIndex, onChange]
  );

  return (
    <MuiTabs
      value={selectedIndex}
      onChange={handleChange}
      centered
      className={css(styles.tabs)}
      sx={{
        '.MuiTabs-indicator': {
          backgroundColor: themeColors.accent,
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab
          className={css(styles.tab)}
          key={tab.label}
          label={tab.label}
          icon={tab.icon}
        />
      ))}
    </MuiTabs>
  );
};

Tabs.defaultProps = {
  selectedIndex: 0,
  onChange: () => {},
};

export default Tabs;
