import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

/** Scrolls to the top on new page visits, but keeps position on Back/Forward. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  useEffect(() => {
    if (navType !== 'POP') window.scrollTo(0, 0);
  }, [pathname, navType]);
  return null;
}
