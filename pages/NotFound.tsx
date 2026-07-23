import React from "react";
import { Link } from "react-router-dom";

const NotFound: React.FC = () => (
  <div className="flex min-h-screen items-center justify-center bg-background-dark px-4 py-32 text-center sm:px-6">
    <div className="max-w-xl">
      <span className="mx-auto grid size-16 place-items-center rounded-full border border-primary/25 bg-primary/10 text-primary"><span className="material-symbols-outlined text-3xl" aria-hidden="true">explore_off</span></span>
      <p className="ui-eyebrow mt-6">Page not found</p>
      <h1 className="ui-page-title mt-3 italic text-white">This path does not lead to a room.</h1>
      <p className="ui-copy mx-auto mt-5 max-w-md">The page may have moved, or the address may be incomplete.</p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/" className="ui-button ui-button-primary">Return home</Link><Link to="/rooms" className="ui-button ui-button-secondary">Explore rooms</Link></div>
    </div>
  </div>
);

export default NotFound;
