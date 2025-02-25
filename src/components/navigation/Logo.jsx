import { Link } from "react-router-dom";

const Logo = () => (
  <div className="flex-shrink-0">
    <Link to="/" className="flex items-center">
      <img
        src="https://assets.fp.scaler.com/seo/_next/static/media/scaler-light.6def257e.svg"
        alt="Scaler Logo"
        className="h-8 w-auto"
      />
      <span className="sr-only">Issue Tracker</span>
    </Link>
  </div>
);

export default Logo;
