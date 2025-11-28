import React, { useState, useEffect, useMemo } from 'react';
// Corrected imports to use direct file names for compilation environment compatibility
import { fetchMindMapData } from 'mindmapApi';
import MindMapCanvas from 'MindMapCanvas';
import DetailsDrawer from 'DetailsDrawer';

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
                setMindMapData(data);
            })
            .catch(e => {
                console.error("Error fetching mind map data:", e);
                setError("Failed to load mind map data.");
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
        return <div className="loading-state text-center p-20 text-xl font-medium text-indigo-600">Loading Mind Map Data...</div>;
    }

    if (error) {
        return <div className="error-state text-center p-20 text-xl text-red-600">{error}</div>;
    }

    return (
        <div className="mindmap-page-layout">
            {/* Main Content Area: Canvas */}
            <div className="mindmap-content">
                <MindMapCanvas
                    initialPages={mindMapData.pages} // Renamed prop
                    initialEdges={mindMapData.edges} // Renamed prop
                    selectedPageId={selectedPageId}
                    onPageSelect={handlePageSelect}
                />
            </div>

            {/* Side Drawer */}
            <DetailsDrawer 
                selectedPage={selectedPage}
                onClose={() => setSelectedPageId(null)}
            />
        </div>
    );
};

export default MindMapPage;