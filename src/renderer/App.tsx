import './css/App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// eslint-disable-next-line import/no-named-default
import Library from './pages/library';
import Login from './pages/login';
import Search from './pages/search';
import NotFound from './pages/404';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Login />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
      </Routes>
    </Router>
  );
}
