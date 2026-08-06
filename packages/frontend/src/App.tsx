import { BrowserRouter, Routes, Route } from 'react-router'
import NoEncontrado from './components/NotFound'
import Login from './components/Login'
import Register from './components/Register'
import Layout from './components/layouts/Layout'
import { Provider } from 'react-redux'
import store from "./store/store.ts"
import { ToastContainer, Slide } from 'react-toastify'

import PoliciesSearch from "./components/policies/PoliciesSearch";
import PoliciesNew from "./components/policies/PoliciesNew/PoliciesNew.tsx";
import PoliciesEdit from "./components/policies/PoliciesEdit/PoliciesEdit.tsx";
import ClientsNew from "./components/clients/ClientsNew";
import ClientsEdit from "./components/clients/ClientsEdit"
import ClientsSearch from "./components/clients/ClientsSearch"
import Settings from "./components/Settings.tsx"
import Dashboard from "./components/Dashboard/Dashboard.tsx"
import CompanyNew from "./components/Companies/CompanyNew.tsx"
import CoverageNew from "./components/coverages/CoverageNew.tsx"
import ProtectedRoute from './components/constants/ProtecterRoute'
import ComissionsPage from './components/comissions/ComissionsPage.tsx'
import ChartsPage from './components/charts/ChartsPage.tsx'
import UnifiedSearch from './components/search/UnifiedSearch.tsx'
import ClaimNew from './components/claims/ClaimNew.tsx'
import ClaimSearch from './components/claims/ClaimSearch.tsx'
import ClaimEdit from './components/claims/ClaimEdit.tsx'
import './App.css'
import CompanyEdit from './components/Companies/CompanyEdit.tsx'

function App() {
  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
          <Routes>

            {/* Con sidebar */}
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />

              {/* Solo ADMIN */}
              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route path="/register" element={<Register />} />
              </Route>

              {/* Solo BROKER y SUB_BROKER */}
              <Route element={<ProtectedRoute allowedRoles={["BROKER", "SUB_BROKER"]} />}>
                <Route path="/policies/search" element={<PoliciesSearch />} />
                <Route path="/policies/new" element={<PoliciesNew />} />
                <Route path="/policies/edit" element={<PoliciesEdit />} />
                <Route path="/clients/new" element={<ClientsNew />} />
                <Route path="/clients/search" element={<ClientsSearch />} />
                <Route path="/clients/edit" element={<ClientsEdit />} />
                <Route path="/companies/new" element={<CompanyNew />} />
                <Route path="/companies/edit" element={<CompanyEdit />} />
                <Route path="/coverages" element={<CoverageNew />} />
                <Route path="/comissions" element={<ComissionsPage />} />
                <Route path="/charts" element={<ChartsPage />} />
                <Route path="/search" element={<UnifiedSearch />} />
                <Route path="/claims/new" element={<ClaimNew />} />
                <Route path="/claims/search" element={<ClaimSearch />} />
                <Route path="/claims/edit" element={<ClaimEdit />} />
              </Route>

              <Route path="/settings" element={<Settings />} />
            </Route>

            {/* Sin sidebar */}
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NoEncontrado />} />

          </Routes>
        </BrowserRouter>
        <ToastContainer
          position="bottom-left"
          autoClose={2000}
          hideProgressBar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover={false}
          theme="colored"
          transition={Slide}
        />
      </Provider>
    </>
  );
}

export default App
