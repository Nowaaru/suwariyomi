import './css/App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// eslint-disable-next-line import/no-named-default
import Library from './pages/library';
import Login from './pages/login';
import Search from './pages/search';
import NotFound from './pages/404';
import View from './pages/view';
import Reader from './pages/reader';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Login />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/view" element={<View />} />
        <Route path="/read" element={<Reader />} />
      </Routes>
    </Router>
  );
}
