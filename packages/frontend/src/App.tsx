import { BrowserRouter, Routes, Route } from 'react-router'
import NoEncontrado from './components/NotFound'
import Login from './components/Login'
import Register from './components/Register'
import Layout from './components/layouts/Layout'

import PoliciesSearch from "./components/policies/PoliciesEdit";
import PoliciesNew from "./components/policies/PoliciesNew";
import PoliciesEdit from "./components/policies/PoliciesSearch";

import './App.css'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>

          {/* Con sidebar */}
          <Route element={<Layout />}>
            <Route path="/register" element={<Register />} />
            <Route path="/policies/search" element={<PoliciesSearch />} />
            <Route path="/policies/new" element={<PoliciesNew />} />
            <Route path="/policies/edit" element={<PoliciesEdit />} />
          </Route>


          {/* Sin sidebar */}
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<NoEncontrado />} />


        </Routes>
      </BrowserRouter >

    </>
  )
}

export default App
