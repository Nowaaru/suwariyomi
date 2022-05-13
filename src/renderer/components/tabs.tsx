import { Tabs as MuiTabs, Tab } from '@mui/material';
import {
  useCallback,
  useState,
  JSXElementConstructor,
  ReactElement,
} from 'react';
import { StyleSheet, css } from 'aphrodite';

const styles = StyleSheet.create({
  tabs: {
    marginBottom: '12px',
  },

  tab: {
    color: '#FFFFFF',
    marginRight: '12px',
    padding: '6px',
    boxSizing: 'border-box',
    width: '165px',
    height: '36px',
    borderRight: 1,
    borderColor: '#DF2935',
  },
});

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
          backgroundColor: '#DF2935',
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
