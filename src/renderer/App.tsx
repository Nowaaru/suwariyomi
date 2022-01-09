import './components/menu';
import './css/App.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
// import Reader from './components/reader';
import Login from './components/login';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}
