import './components/menu';
import './css/App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// eslint-disable-next-line import/no-named-default
import Library from './components/library';
import Login from './components/login';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Library />} />
      </Routes>
    </Router>
  );
}
