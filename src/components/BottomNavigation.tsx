import { NavLink } from "react-router-dom";
import { Home, Users, FileText, Settings } from 'lucide-react';

const navItems = [
    { path: "/home", label: "Asosiy", icon: Home },
    { path: "/clients", label: "Mijozlar", icon: Users },
    { path: "/reports", label: "Hisobot", icon: FileText },
    { path: "/settings", label: "Sozlama", icon: Settings },
];

const BottomNavigation = () => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200/50 shadow-lg z-50">
            <div className="max-w-md mx-auto px-4">
                <div className="flex justify-around items-center h-16">
                    {navItems.map((item) => (
                        <NavLink
                            to={item.path}
                            key={item.path}
                            className={({ isActive }) =>
                                `relative flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-300 min-w-[60px] ${isActive
                                    ? "text-blue-600 transform scale-105"
                                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    {/* Active indicator */}
                                    {isActive && (
                                        <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-blue-600 rounded-full"></div>
                                    )}

                                    {/* Icon container */}
                                    <div className={`p-1 rounded-lg transition-all duration-300 ${isActive ? "bg-blue-50" : ""
                                        }`}>
                                        <item.icon
                                            size={22}
                                            className={`transition-all duration-300 ${isActive ? "text-blue-600" : "text-gray-500"
                                                }`}
                                        />
                                    </div>

                                    {/* Label */}
                                    <span className={`text-xs font-medium mt-1 transition-all duration-300 ${isActive ? "text-blue-600" : "text-gray-500"
                                        }`}>
                                        {item.label}
                                    </span>

                                    {/* Active background */}
                                    {isActive && (
                                        <div className="absolute inset-0 bg-blue-50/50 rounded-xl -z-10"></div>
                                    )}
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>
            </div>

            {/* Safe area for devices with home indicator */}
            <div className="h-safe-area-inset-bottom bg-white/95"></div>
        </nav>
    );
};

export default BottomNavigation;
