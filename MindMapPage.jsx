// src/pages/MindMapPage.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { fetchMindMapData } from '../api/mindmapApi';
import MindMapCanvas from '../components/mindMap/MindMapCanvas';
import DetailsDrawer from '../components/mindMap/DetailsDrawer';

/**
 * Page component that handles data fetching and state management for the Mind Map.
 */
const MindMapPage = () => {
    const [mindMapData, setMindMapData] = useState({ pages: [], edges: [] });
    const [loading, setLoading] = useState(true);
    const [selectedPageId, setSelectedPageId] = useState(null);
    const [error, setError] = useState(null);

    // 1. Data Fetching
    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchMindMapData()
            .then(data => {
                // Ensure data is received in the expected format
                if (data && Array.isArray(data.pages) && Array.isArray(data.edges)) {
                    setMindMapData(data);
                } else {
                    throw new Error("API returned invalid data structure.");
                }
            })
            .catch(e => {
                console.error("Error fetching mind map data:", e);
                // Log the exact error to the console
                setError("Failed to load mind map data. Check console for details.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    // 2. Select Page Logic
    const handlePageSelect = (page) => {
        // If the same page is clicked, unselect it (close the drawer)
        if (page.id === selectedPageId) {
            setSelectedPageId(null);
        } else {
            setSelectedPageId(page.id);
        }
    };

    // 3. Find the currently selected page object for the drawer
    const selectedPage = useMemo(() => 
        mindMapData.pages.find(p => p.id === selectedPageId)
    , [mindMapData.pages, selectedPageId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="loading-state text-center p-20 text-xl font-medium text-indigo-600">
                    <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Application Flow Map...
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="error-state text-center p-20 text-xl text-red-600 bg-red-50 border border-red-300 rounded-lg m-10">{error}</div>;
    }

    return (
        <div className="mindmap-page-layout">
            {/* Main Content Area: Canvas */}
            <div className={`mindmap-content ${selectedPageId ? 'has-drawer-open' : ''}`}>
                <MindMapCanvas
                    initialPages={mindMapData.pages}
                    initialEdges={mindMapData.edges}
                    selectedPageId={selectedPageId}
                    onPageSelect={handlePageSelect}
                />
            </div>

            {/* Side Drawer */}
            <DetailsDrawer 
                selectedPage={selectedPage}
                onClose={() => setSelectedPageId(null)}
            />

            <style jsx="true">{`
                .mindmap-page-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f8fafc;
                    font-family: 'Inter', sans-serif;
                }

                .mindmap-content {
                    flex-grow: 1;
                    padding: 2rem;
                    overflow-y: auto;
                    transition: margin-right 0.3s ease-in-out;
                    margin-right: 0; /* Default: no margin */
                }

                .mindmap-content.has-drawer-open {
                    margin-right: 400px; /* Space for the open drawer */
                }

                .mindmap-canvas-container {
                    height: calc(100vh - 4rem);
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .react-flow-wrapper {
                    width: 100%;
                    height: 100%;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.75rem;
                    background-color: #ffffff;
                    position: relative;
                    /* Updated to allow scrolling */
                    overflow: auto; 
                }

                /* React Flow Simulation Styles - CANVAS BACKGROUND FIX */
                .react-flow__canvas {
                    position: relative;
                    /* Ensure minimum size to accommodate the 1200px centered layout and enable scroll */
                    min-width: 1200px; 
                    min-height: 100%; 
                    
                    background-color: #f7f7f7; 
                    background-image: radial-gradient(#e0e0e0 1px, transparent 0);
                    background-size: 25px 25px;
                    background-position: -1px -1px;
                }

                /* Page Node Styles (The box in the flow) */
                .page-node.flow-node-style {
                    position: absolute;
                    width: 300px;
                    height: 60px;
                    padding: 0.5rem 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    text-align: center;
                    transition: all 0.2s ease-in-out;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06);
                    z-index: 10;
                }

                .page-node.flow-node-style:hover {
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1);
                }

                .page-node.flow-node-style.selected {
                    border: 3px solid #4f46e5;
                    background-color: #e0e7ff;
                    box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.3);
                }

                /* Edge Simulation Styles - ARROW FIX */
                .flow-edge-style {
                    position: absolute;
                    width: 2px;
                    left: 0;
                    z-index: 5;
                    pointer-events: none;
                }

                .edge-line {
                    width: 100%;
                    /* Line takes up height minus arrow size to leave space for the triangle */
                    height: calc(100% - 10px); 
                    background-color: #4f46e5;
                    position: relative;
                }

                .edge-line::after {
                    content: '';
                    position: absolute;
                    /* Position the triangle right at the end of the line element */
                    bottom: -10px; 
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-top: 10px solid #4f46e5; /* The arrow triangle */
                    box-sizing: content-box;
                    z-index: 10; /* Ensure arrow is above background */
                }

                .edge-label-simulated {
                    position: absolute;
                    left: 50%;
                    transform: translate(-50%, -50%); /* Center horizontally and vertically */
                    padding: 0.25rem 0.5rem;
                    background-color: #fff;
                    border: 1px solid #c7d2fe;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    color: #4338ca;
                    font-weight: 600;
                    white-space: nowrap;
                    z-index: 15;
                }

                /* Details Drawer Styles */
                .details-drawer {
                    width: 0;
                    position: fixed;
                    top: 0;
                    right: 0;
                    height: 100vh;
                    background: #ffffff;
                    box-shadow: -6px 0 16px rgba(0, 0, 0, 0.15);
                    transition: width 0.3s ease-in-out;
                    overflow-y: hidden;
                    z-index: 50;
                }

                .details-drawer.open {
                    width: 400px;
                    overflow-y: auto;
                }

                @media (max-width: 1024px) {
                    .details-drawer.open {
                        width: 320px;
                    }
                    .mindmap-content.has-drawer-open {
                        margin-right: 320px;
                    }
                }

                @media (max-width: 768px) {
                    .details-drawer {
                        width: 0;
                    }
                    .details-drawer.open {
                        width: 100%;
                    }
                    .mindmap-content.has-drawer-open {
                        margin-right: 0; /* Full width canvas on mobile, drawer overlays */
                    }
                }
            `}</style>
        </div>
    );
};

export default MindMapPage;
