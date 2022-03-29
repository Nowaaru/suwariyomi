import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// These are the hooks that are used to listen to events from main.ts.
// Should be present in every page component.

const useEvent = () => {
  useEffect(() => {
    window.electron.ipcRenderer.on(
      'open-protocol',
      (e, data1, data2, data3) => {
        window.electron.log.info(e, data1, data2, data3);
      }
    );
  });
};

export default useEvent;
