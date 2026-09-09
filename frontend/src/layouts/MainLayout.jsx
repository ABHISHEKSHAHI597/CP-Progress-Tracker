import { Outlet } from "react-router-dom";

import TopNav from "../components/TopNav";
import BackToTop from "../components/BackToTop";

function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <TopNav />

      <main className="flex-1 w-full mx-auto max-w-[1180px] px-4 sm:px-6 py-8 sm:py-10">
        <Outlet />
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 py-6 flex flex-wrap gap-x-6 gap-y-2 items-center justify-between text-[12.5px] text-faint">
          <p>Ratings come from Codeforces. Contests also come from LeetCode, CodeChef and AtCoder.</p>
          <p>Ratings refresh every few minutes, solve counts every half hour.</p>
        </div>
      </footer>

      <BackToTop />
    </div>
  );
}

export default MainLayout;
