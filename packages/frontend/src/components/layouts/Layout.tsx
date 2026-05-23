import { Outlet } from "react-router";
import Sidebar from "../sidebar/Sidebar";
 
const Layout = () => (
    <div className="layout">
        <Sidebar />
        <main className="main-content">
            <Outlet />
        </main>
    </div>
);
 
export default Layout;
 