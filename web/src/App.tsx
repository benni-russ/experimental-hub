import { Route, Routes } from 'react-router';
import { Layout } from './Layout.js';
import { NotFound } from './pages/NotFound.js';
import { Notes } from './pages/Notes.js';
import { Path } from './pages/Path.js';
import { Project } from './pages/Project.js';
import { Review } from './pages/Review.js';
import { Search } from './pages/Search.js';
import { Today } from './pages/Today.js';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Today />} />
        <Route path="pfad" element={<Path />} />
        <Route path="projekt/:id" element={<Project />} />
        <Route path="lernrunde" element={<Review />} />
        <Route path="notizen" element={<Notes />} />
        <Route path="suche" element={<Search />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
