// src/components/mindMap/MindMapCanvas.jsx

import React, { useMemo, useEffect, useCallback, useState } from 'react';

// --- Dagre and React Flow Simulation Helpers (Mocked) ---

// Node dimensions used in Dagre calculation
const NODE_WIDTH = 300;
const NODE_HEIGHT = 60;
const ARROW_HEIGHT = 10; 
const CONCEPTUAL_CANVAS_WIDTH = 1200; // Used for centering the graph

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
        const nodeHeight = NODE_HEIGHT;
        const separation = 150; 
        const CENTER_X = CONCEPTUAL_CANVAS_WIDTH / 2; // Center the graph horizontally
        
        let y = 50; 
        g.nodes().forEach(id => {
            const node = g.node(id);
            node.x = CENTER_X; // Apply the calculated center X position
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
        {/* Placeholder for Zoom/Fit buttons */}
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
        // The container needs to match the dimensions of the inner canvas to enable scrolling on the wrapper
        <div style={{ position: 'relative', width: `${CONCEPTUAL_CANVAS_WIDTH}px`, height: '100%', minHeight: '100%' }}>
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
                    
                    // Source node bottom center coordinates (visual center of 300x60 node)
                    const startX = sourceNode.position.x + (NODE_WIDTH / 2); // X center
                    const startY = sourceNode.position.y + NODE_HEIGHT; // Bottom edge of the node

                    // Target node top center coordinates
                    const endY = targetNode.position.y; // Top edge of the node

                    const height = endY - startY; // Distance between bottom of source and top of target

                    if (height <= ARROW_HEIGHT) return null; // Avoid drawing if too close

                    return (
                        <div key={edge.id} className="flow-edge-style" style={{
                            // Position container at the start of the line, centered horizontally
                            transform: `translate(${startX - 1}px, ${startY}px)`, // -1px for 2px line width
                            height: `${height}px`,
                            width: '2px', // Line width
                        }}>
                            {/* Line element. Arrow is handled by ::after */}
                            <div className="edge-line"></div> 
                            
                            {/* Label positioning needs to be relative to the entire line container */}
                            <div className="edge-label-simulated" style={{
                                top: `${height / 2}px`, // Place label in the middle of the line segment
                            }}>{edge.label}</div>
                        </div>
                    );
                })}

            </div>
            {children}
        </div>
    );
};

/**
 * Computes the positions of nodes using the mocked Dagre layout algorithm.
 * @param {Array} nodes - React Flow compatible nodes.
 * @param {Array} edges - React Flow compatible edges.
 * @param {string} direction - Graph layout direction ('TB' or 'LR').
 * @returns {Object} An object containing the layouted nodes and edges.
 */
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    
    // GUARD CLAUSE: Important for safety
    if (!nodes || nodes.length === 0) {
        return { layoutedNodes: [], layoutedEdges: [] };
    }
    
    const g = new dagre.graphlib.Graph();
    
    g.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 }); // Dagre options

    // 1. Add nodes to the graph
    nodes.forEach((node) => {
        g.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
        // Preserve original data
        node.data.dimensions = { width: NODE_WIDTH, height: NODE_HEIGHT };
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
        
        // Dagre position (x, y) is the center of the node. We convert it to top-left (React Flow convention).
        node.position = {
            // nodeWithLayout.x is CONCEPTUAL_CANVAS_WIDTH / 2 (600), so x = 600 - 150 = 450
            x: nodeWithLayout.x - (NODE_WIDTH / 2),
            y: nodeWithLayout.y - (NODE_HEIGHT / 2),
        };

        return node;
    });

    return { layoutedNodes, layoutedEdges: edges };
};

// --- End Dagre and React Flow Simulation Helpers ---


/**
 * Renders the mind map using a graph visualization library (simulated React Flow)
 * and uses Dagre to compute the node positions.
 */
const MindMapCanvas = ({ initialPages, initialEdges, selectedPageId, onPageSelect }) => {
    
    // Convert raw data into React Flow compatible nodes and edges, and calculate positions
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
            },
            position: { x: 0, y: 0 }, // Placeholder, Dagre will set this
            type: 'default', // Using a default type
            selected: page.id === selectedPageId // Apply initial selection state
        }));
        
        // 2. Map edges to React Flow edges
        const edges = (initialEdges || []).map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
        }));

        // 3. Apply Dagre Layout
        return getLayoutedElements(nodes, edges, 'TB'); // 'TB' = Top to Bottom
    }, [initialPages, initialEdges, selectedPageId]); // Include selectedPageId for accurate initial rendering

    const [nodes, setNodes] = useNodesState(layoutedNodes);
    const [edges, setEdges] = useEdgesState(layoutedEdges);

    // Update nodes/edges state when layoutedNodes changes (initial load/data change)
    useEffect(() => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);


    // Highlight selected node (This useEffect is only needed for dynamic updates after initial load)
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
            <h1 className="text-3xl font-extrabold text-gray-700 p-4 text-center">Application Flow Map</h1>
            
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

export default MindMapCanvas;
