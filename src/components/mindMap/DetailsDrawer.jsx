import React from 'react';

/**
 * Right-side details drawer to display information for a selected page/node.
 * @param {Object} selectedPage - The currently selected page object.
 * @param {Function} onClose - Function to close the drawer.
 */
const DetailsDrawer = ({ selectedPage, onClose }) => {
    const isOpen = !!selectedPage;

    // Use a CSS class to control the drawer's visibility and animation
    return (
        <div className={`details-drawer ${isOpen ? 'open' : ''}`}>
            <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">Page Details</h2>
                <button 
                    onClick={onClose} 
                    className="text-gray-500 hover:text-gray-700 text-2xl font-semibold"
                    aria-label="Close details drawer"
                >
                    &times;
                </button>
            </div>

            {isOpen && (
                <div className="p-4 space-y-4">
                    <h3 className="text-2xl font-extrabold text-indigo-700">{selectedPage.label}</h3>
                    
                    {/* Page URL */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-500 mb-1">URL</p>
                        <a 
                            href={selectedPage.metadata.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-indigo-600 hover:text-indigo-800 break-all transition duration-150"
                        >
                            {selectedPage.metadata.url}
                        </a>
                    </div>

                    {/* Key Elements List */}
                    <div className="space-y-3">
                        <h4 className="text-lg font-semibold border-b pb-1 text-gray-700">Key Elements</h4>
                        {selectedPage.metadata.key_elements && selectedPage.metadata.key_elements.length > 0 ? (
                            <ul className="list-none space-y-2">
                                {selectedPage.metadata.key_elements.map(element => (
                                    <li key={element.id} className="bg-white p-3 border border-l-4 border-l-green-500 rounded shadow-sm">
                                        <div className="flex justify-between items-start">
                                            <span className="font-medium text-gray-800">{element.text}</span>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                                element.type === 'button' ? 'bg-blue-100 text-blue-800' : 
                                                element.type === 'input' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-pink-100 text-pink-800'
                                            }`}>
                                                {element.type}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 italic">No key elements documented for this page.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailsDrawer;