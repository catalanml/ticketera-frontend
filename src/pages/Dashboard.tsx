import React from 'react';

const Dashboard: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col">
            {/* Header */}
            <header className="bg-gray-800 text-white px-4 py-4">
                <h1 className="text-xl font-semibold">Dashboard</h1>
            </header>

            <div className="flex flex-1">
                {/* Sidebar */}
                <aside className="w-64 bg-gray-100 p-4">
                    <nav>
                        <ul>
                            <li className="mb-2">
                                <a href="#" className="text-gray-700 hover:text-gray-900">
                                    Home
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="#" className="text-gray-700 hover:text-gray-900">
                                    Profile
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="#" className="text-gray-700 hover:text-gray-900">
                                    Settings
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="#" className="text-gray-700 hover:text-gray-900">
                                    Messages
                                </a>
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded shadow">
                            <h2 className="font-bold mb-2">Card Title 1</h2>
                            <p>
                                This is a dummy dashboard card. You can replace this text with your actual content.
                            </p>
                        </div>
                        <div className="bg-white p-4 rounded shadow">
                            <h2 className="font-bold mb-2">Card Title 2</h2>
                            <p>
                                Another content card for your dashboard. Customize as needed.
                            </p>
                        </div>
                    </div>
                </main>
            </div>

            {/* Footer */}
            <footer className="bg-gray-800 text-white px-4 py-2 text-center">
                © 2023 Dashboard Example
            </footer>
        </div>
    );
};

export default Dashboard;