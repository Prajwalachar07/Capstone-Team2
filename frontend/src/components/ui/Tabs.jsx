import React from 'react';

const Tabs = ({ tabs, activeTab, onTabChange }) => {
    return (
        <div>
            <div className="sm:hidden">
                <label htmlFor="tabs" className="sr-only">
                    Select a tab
                </label>
                <select
                    id="tabs"
                    name="tabs"
                    className="block w-full rounded-lg border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
                    value={activeTab}
                    onChange={(e) => onTabChange(e.target.value)}
                >
                    {tabs.map((tab) => (
                        <option key={tab.id} value={tab.id}>
                            {tab.label}
                        </option>
                    ))}
                </select>
            </div>
            <div className="hidden sm:block">
                <div className="border-b border-slate-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => onTabChange(tab.id)}
                                className={`
                  ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                                    }
                  whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors duration-200
                `}
                                aria-current={activeTab === tab.id ? 'page' : undefined}
                            >
                                {tab.icon && <span className="mr-2">{tab.icon}</span>}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    );
};

export default Tabs;
