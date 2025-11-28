import React, { useState, useEffect, useMemo, useCallback } from 'react';
// The following modules are now defined inline to resolve the compilation errors.

// --- 1. MOCK API (Replaces src/api/mindmapApi.js) ---

const mockData = {
    pages: [
        {
            id: "page1",
            label: "Home Page",
            metadata: {
                url: "https://www.humana.com",
                key_elements: [
                    { id: "1", text: "Login Button", type: "button" },
                    { id: "2", text: "Support Link", type: "link" },
                ]
            }
        },
        {
            id: "page2",
            label: "Login Page",
            metadata: {
                url: "https://www.humana.com/login",
                key_elements: [
                    { id: "3", text: "Email Input", type: "input" },
                    { id: "4", text: "Password Input", type: "input" },
                    { id: "5", text: "Login Button", type: "button" },
                ]
            }
        },
        {
            id: "page3",
            label: "Support Page",
            metadata: {
                url: "https://www.humana.com/support",
                key_elements: [
                    { id: "6", text: "FAQ Link", type: "link" },
                ]
            }
        }
    ],
    edges: [
        {
            id: "edge1",
            source: "page1",
            target: "page2",
            label: "User clicks Login Button"
        },
        {
            id: "edge2",
            source: "page2",
            target: "page3",
            label: "User clicks 'Forgot Password' (simulated path)"
        }
    ]
};

const fetchMindMapData = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("Mind map data fetched.");
            resolve(mockData);
        }, 800);
    });
};


// --- 2. Details Drawer Component (Replaces src/components/mindMap/DetailsDrawer.jsx) ---

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
                                {keyElements.map((el, index) => (
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


// --- 3. MindMap Canvas Component (Replaces src/components/mindMap/MindMapCanvas.jsx) ---

// --- Dagre and React Flow Simulation Helpers ---

// Dagre graph instance simulation
const dagre = {
    graphlib: {
        Graph: function() {
            this._nodes = {};
            this._edges = [];
            this.setGraph = () => {};
            this.setNode = (id, obj) => { this._nodes[id] = obj; };
            this.setEdge = (u, v) => { this._edges.push({ u, v }); };
            this.nodes = () => Object.keys(this._nodes);
            this.node = (id) => this._nodes[id];
        }
    },
    layout: (g) => {
        // Simple vertical layout logic (simulating DAG)
        const nodeHeight = 60; // Approximate height for a node
        const separation = 80;
        
        let y = 0;
        g.nodes().forEach(id => {
            const node = g.node(id);
            node.x = 0; // Center horizontally (or adjust as needed)
            node.y = y;
            y += nodeHeight + separation;
        });
    }
};

// React Flow Mock Hooks/Components
const useNodesState = (initialNodes) => useState(initialNodes);
const useEdgesState = (initialEdges) => useState(initialEdges);

const Background = () => <div className="flow-background-simulated"></div>;
const Controls = () => (
    <div className="flow-controls-simulated absolute top-4 right-4 bg-white p-2 rounded-lg shadow-md flex flex-col space-y-2">
        <button className="text-gray-600 hover:text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
        <button className="text-gray-600 hover:text-indigo-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m5.632 1.348a3 3 0 11-5.632 1.348" /></svg>
        </button>
    </div>
);

const ReactFlow = ({ nodes, edges, onNodeClick, children }) => {
    // Render the nodes and edges based on calculated positions
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <div className="react-flow__canvas">
                {nodes.map(node => (
                    <div 
                        key={node.id}
                        className={`page-node flow-node-style ${node.selected ? 'selected' : ''}`}
                        style={{ transform: `translate(${node.position.x}px, ${node.position.y}px)` }}
                        onClick={() => onNodeClick(null, node)}
                    >
                        <div className="text-lg font-semibold">{node.data.label}</div>
                    </div>
                ))}
                
                {edges.map(edge => {
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    const targetNode = nodes.find(n => n.id === edge.target);

                    if (!sourceNode || !targetNode) return null;
                    
                    // Simple positioning logic for edge line simulation
                    const midX = sourceNode.position.x;
                    const midY = sourceNode.position.y + 60; // Start below the node
                    const height = targetNode.position.y - midY; // Distance between nodes

                    return (
                        <div key={edge.id} className="flow-edge-style" style={{
                            transform: `translate(${midX + 150}px, ${midY - 10}px)`, // Adjust positioning for center of 300px node
                            height: `${height}px`,
                        }}>
                            <div className="edge-line"></div>
                            <div className="edge-label-simulated">{edge.label}</div>
                        </div>
                    );
                })}

            </div>
            {children}
        </div>
    );
};

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    
    // GUARD CLAUSE: Important for safety
    if (!nodes || nodes.length === 0) {
        return { layoutedNodes: [], layoutedEdges: [] };
    }
    
    const g = new dagre.graphlib.Graph();
    
    g.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 }); // Dagre options

    // 1. Add nodes to the graph
    nodes.forEach((node) => {
        g.setNode(node.id, { width: 300, height: 60, ...node.data.dimensions });
    });

    // 2. Add edges to the graph
    edges.forEach((edge) => {
        g.setEdge(edge.source, edge.target);
    });

    // 3. Run the Dagre layout algorithm
    dagre.layout(g);

    // 4. Update node positions based on Dagre's results
    const layoutedNodes = nodes.map((node) => {
        const nodeWithLayout = g.node(node.id);
        
        node.position = {
            x: nodeWithLayout.x - (node.data.dimensions?.width / 2 || 150),
            y: nodeWithLayout.y - (node.data.dimensions?.height / 2 || 30),
        };

        return node;
    });

    return { layoutedNodes, layoutedEdges: edges };
};
// --- End Dagre and React Flow Simulation Helpers ---


/**
 * Renders the mind map using a graph visualization library (like React Flow)
 * and uses Dagre to compute the node positions.
 */
const MindMapCanvas = ({ initialPages, initialEdges, selectedPageId, onPageSelect }) => {
    
    // Convert raw data into React Flow compatible nodes and edges
    const { layoutedNodes, layoutedEdges } = useMemo(() => {
        
        // CRITICAL GUARD: Stop processing if data is missing or empty
        if (!initialPages || initialPages.length === 0) {
            return { layoutedNodes: [], layoutedEdges: [] };
        }
        
        // 1. Map pages to React Flow nodes
        const nodes = initialPages.map(page => ({
            id: page.id,
            // Guard against missing metadata or label for safety
            data: { 
                label: page.label || 'Unknown Page', 
                metadata: page.metadata || { url: '', key_elements: [] },
                dimensions: { width: 300, height: 60 } 
            },
            position: { x: 0, y: 0 }, // Placeholder, Dagre will set this
            type: 'default', // Using a default type
        }));
        
        // 2. Map edges to React Flow edges
        const edges = (initialEdges || []).map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            // These properties are for a real React Flow implementation, but help structure the mock
            type: 'smoothstep', 
            markerEnd: { type: 'arrowclosed' },
            style: { strokeWidth: 2, stroke: '#4f46e5' },
            labelBgStyle: { fill: '#fff', fillOpacity: 0.8 },
            labelStyle: { fill: '#4f46e5', fontWeight: 600 }
        }));

        // 3. Apply Dagre Layout
        return getLayoutedElements(nodes, edges, 'TB'); // 'TB' = Top to Bottom
    }, [initialPages, initialEdges]);

    const [nodes, setNodes] = useNodesState(layoutedNodes);
    const [edges, setEdges] = useEdgesState(layoutedEdges);

    // Update nodes state when layoutedNodes changes (initial load/data change)
    useEffect(() => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);


    // Highlight selected node
    useEffect(() => {
        setNodes(nds => nds.map(node => ({
            ...node,
            selected: node.id === selectedPageId
        })));
    }, [selectedPageId, setNodes]);


    // Handle node click event from React Flow
    const onNodeClickInternal = useCallback((event, node) => {
        // Find the original page data
        const originalPage = initialPages.find(p => p.id === node.id);
        if (originalPage) {
            onPageSelect(originalPage);
        }
    }, [initialPages, onPageSelect]);

    // Handle case where data is still initializing or empty
    if (nodes.length === 0) {
        return <div className="p-10 text-center text-gray-500">Initializing canvas...</div>;
    }

    return (
        <div className="mindmap-canvas-container">
            <h1 className="text-3xl font-extrabold text-gray-700 p-4 text-center">MindMap for Application</h1>
            
            <div className="react-flow-wrapper">
                {/* Simplified ReactFlow component */}
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodeClick={onNodeClickInternal}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>
        </div>
    );
};


// --- 4. Main Page Component (Original src/pages/MindMapPage.jsx logic) ---

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

            {/* In a real multi-file project, CSS would be external. Here it's assumed */}
            <style jsx="true">{`
                .mindmap-page-layout {
                    display: flex;
                    min-height: 100vh;
                    background-color: #f8fafc;
                }

                .mindmap-content {
                    flex-grow: 1;
                    padding: 2rem;
                    overflow-y: auto;
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
                    border-radius: 0.5rem;
                    background-color: #ffffff;
                    position: relative;
                }

                /* React Flow Simulation Styles */
                .react-flow__canvas {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    background: #f8fafc;
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
                }

                /* Edge Simulation Styles */
                .flow-edge-style {
                    position: absolute;
                    width: 2px;
                    left: 0;
                    z-index: 5;
                    pointer-events: none;
                }

                .edge-line {
                    width: 100%;
                    height: 100%;
                    background-color: #4f46e5;
                    position: relative;
                }

                .edge-line::after {
                    content: '';
                    position: absolute;
                    bottom: -10px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 0;
                    height: 0;
                    border-left: 10px solid transparent;
                    border-right: 10px solid transparent;
                    border-top: 10px solid #4f46e5;
                }

                .edge-label-simulated {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 0.25rem 0.5rem;
                    background-color: #fff;
                    border: 1px solid #c7d2fe;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    color: #4338ca;
                    font-weight: 600;
                    white-space: nowrap;
                }

                /* Details Drawer Styles */
                .details-drawer {
                    width: 0;
                    position: fixed;
                    top: 0;
                    right: 0;
                    height: 100vh;
                    background: #ffffff;
                    box-shadow: -4px 0 12px rgba(0, 0, 0, 0.1);
                    transition: width 0.3s ease-in-out;
                    overflow-y: hidden; /* Hide scrollbar when closed */
                    z-index: 50;
                }

                .details-drawer.open {
                    width: 400px;
                    overflow-y: auto; /* Allow scrolling when open */
                }

                @media (max-width: 768px) {
                    .details-drawer.open {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default MindMapPage;
