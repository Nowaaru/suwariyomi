import './components/menu';
import './css/App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// eslint-disable-next-line import/no-named-default
import { default as Main } from './components/library';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
      </Routes>
    </Router>
  );
}
