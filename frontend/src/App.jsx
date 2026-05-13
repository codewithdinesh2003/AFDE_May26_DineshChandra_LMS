import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Dashboard from './pages/Dashboard'
import Books from './pages/Books'
import Borrowers from './pages/Borrowers'
import Transactions from './pages/Transactions'
import Search from './pages/Search'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="books" element={<Books />} />
          <Route path="borrowers" element={<Borrowers />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="search" element={<Search />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
