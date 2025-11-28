// src/components/mindMap/DetailsDrawer.jsx

import React from 'react';

/**
 * Renders a side drawer to display details of the selected page.
 */
const DetailsDrawer = ({ selectedPage, onClose }) => {
    const isOpen = !!selectedPage;

    // Use selectedPage?.metadata to safely access nested properties
    const url = selectedPage?.metadata?.url || 'N/A';
    const keyElements = selectedPage?.metadata?.key_elements || [];

    return (
        <div className={`details-drawer ${isOpen ? 'open' : ''}`}>
            <div className="p-6 h-full flex flex-col">
                <div className="flex justify-between items-start mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 break-words max-w-[80%]">
                        {selectedPage?.label || "Page Details"}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="p-2 text-gray-500 hover:text-gray-900 rounded-full transition-colors"
                        aria-label="Close details drawer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {selectedPage ? (
                    <div className="flex-grow overflow-y-auto space-y-6 pb-10">
                        <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                            <h3 className="text-sm font-medium text-gray-500 mb-1">URL</h3>
                            <p className="text-indigo-600 font-semibold text-sm break-all">{url}</p>
                        </div>

                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">Key Elements ({keyElements.length})</h3>
                            <ul className="space-y-3">
                                {keyElements.map((el) => (
                                    <li key={el.id} className="p-3 bg-white border border-gray-200 rounded-lg flex items-center justify-between shadow-sm">
                                        <span className="text-sm text-gray-700">{el.text}</span>
                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                            el.type === 'button' ? 'bg-green-100 text-green-800' : 
                                            el.type === 'link' ? 'bg-blue-100 text-blue-800' : 
                                            'bg-purple-100 text-purple-800'
                                        }`}>
                                            {el.type}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            {keyElements.length === 0 && (
                                <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">No key elements documented for this page.</p>
                            )}
                        </div>

                        <div className="pt-4 border-t">
                            <h3 className="text-md font-semibold text-gray-700 mb-2">Detailed Flow Information</h3>
                            <p className="text-sm text-gray-500">
                                This section would contain history, access metrics, or full component tree data from a real application.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 p-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-3 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p>Click on any page node to view its detailed information here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailsDrawer;
