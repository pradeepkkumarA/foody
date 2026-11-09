import { Link } from 'react-router-dom';
import StatusMessage from '../components/StatusMessage.jsx';

export default function NotFound() {
  return (
    <StatusMessage
      emoji="🍳"
      title="Page not found"
      action={
        <Link to="/" className="rounded-full bg-orange-600 px-5 py-2 font-semibold text-white hover:bg-orange-700">
          Back to recipes
        </Link>
      }
    >
      This page seems to have been eaten.
    </StatusMessage>
  );
}
