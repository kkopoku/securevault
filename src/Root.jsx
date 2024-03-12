import { Outlet } from "react-router-dom";
// import NavItem from "./components/NavItem";
// import Navbar from "./components/Navbar";

export default function Root() {
  return (
    <div className='v-full w-full align-middle min-h-screen'>
      <div id="page" className="h-full w-full">
        <Outlet />
      </div>
    </div>
  );
}