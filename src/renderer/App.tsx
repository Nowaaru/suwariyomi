import './components/menu';
import './css/App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// eslint-disable-next-line import/no-named-default
import Library from './pages/library';
import Login from './pages/login';

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
