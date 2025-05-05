// app/components/Navbar.tsx
import Link from 'next/link';

const Navbar: React.FC = () => {
  return (
    <nav className="bg-gray-900 text-white py-4 px-6 fixed top-0 left-0 w-full z-50 shadow-lg">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-semibold">
          <Link href="/" className="transition-all cursor-pointer">
            AvatarLab
          </Link>
        </div>

        <div className="hidden md:flex space-x-8">
          {/* Direct link to sections using href */}
          <Link href="#services" className="hover:text-indigo-400 transition-all cursor-pointer">
            Services
          </Link>
          <Link href="#pricing" className="hover:text-indigo-400 transition-all cursor-pointer">
            Pricing
          </Link>
          <Link href="#reviews" className="hover:text-indigo-400 transition-all cursor-pointer">
            Reviews
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all">
            Login
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
