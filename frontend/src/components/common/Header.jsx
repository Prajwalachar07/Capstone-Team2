import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Menu, X, LogOut, LayoutDashboard } from 'lucide-react';
import Button from '../ui/Button';
import logo from '../../assets/images/logo.svg';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Reset dropdown states when navigating
    useEffect(() => {
        setIsMenuOpen(false);
        setIsProfileOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const getRoleDisplay = () => {
        if (!user) return '';
        return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <img src={logo} alt="FHIR Health Exchange" className="h-8 w-auto" />
                        <span className="hidden sm:block text-lg font-semibold text-slate-900">
                            FHIR Health Exchange
                        </span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex items-center gap-4">
                        {!user ? (
                            <>
                                <Link
                                    to="/"
                                    className="text-sm font-medium text-slate-600 hover:text-indigo-600 transition"
                                >
                                    Home
                                </Link>

                                <Link to="/login">
                                    <Button variant="outline" size="sm">
                                        Login
                                    </Button>
                                </Link>

                                <Link to="/register">
                                    <Button variant="primary" size="sm">
                                        Register
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <div className="flex items-center gap-4">

                                <span className="text-sm text-slate-500">
                                    Role:
                                    <span className="ml-1 font-semibold text-indigo-600">
                                        {getRoleDisplay()}
                                    </span>
                                </span>

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsProfileOpen(!isProfileOpen)}
                                        className="flex items-center gap-2 rounded-full px-2 py-1.5 hover:bg-slate-100 transition"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                            <User size={18} />
                                        </div>
                                        <span className="hidden md:block text-sm font-medium text-slate-700">
                                            {user.firstName || user.name}
                                        </span>
                                    </button>

                                    {isProfileOpen && (
                                        <div className="absolute right-0 mt-3 w-56 rounded-xl bg-white shadow-lg border border-slate-200 animate-fade-in">
                                            <div className="px-4 py-3 border-b">
                                                <p className="text-xs text-slate-500">Signed in as</p>
                                                <p className="text-sm font-medium text-slate-900 truncate">
                                                    {user.email}
                                                </p>
                                            </div>

                                            <Link
                                                to={`/${user.role}/dashboard`}
                                                onClick={() => setIsProfileOpen(false)}
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                                            >
                                                <LayoutDashboard size={16} />
                                                Dashboard
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                            >
                                                <LogOut size={16} />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="sm:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 transition"
                        >
                            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="sm:hidden border-t border-slate-200 bg-white animate-slide-up">
                    <div className="px-4 py-4 space-y-3">
                        {!user ? (
                            <>
                                <Link to="/" className="block text-sm text-slate-700">Home</Link>
                                <Link to="/login" className="block text-sm text-slate-700">Login</Link>
                                <Link to="/register" className="block text-sm text-slate-700">Register</Link>
                            </>
                        ) : (
                            <>
                                <div className="border-b pb-3">
                                    <p className="text-sm font-medium text-slate-900">{user.firstName}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>

                                <Link
                                    to={`/${user.role}/dashboard`}
                                    className="block text-sm text-slate-700"
                                >
                                    Dashboard
                                </Link>

                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left text-sm text-red-600"
                                >
                                    Logout
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
