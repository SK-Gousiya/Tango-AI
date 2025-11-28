import React, { useState, useCallback, useMemo, useEffect } from 'react';
// Assuming React Flow and Dagre are available in the project environment
// For this single-file output, we will simulate the necessary helper functions.
// In a real project, you would install: npm install reactflow dagre

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
        const nodeWidth = 300; // Approximate width for a node
        const separation = 80;
        
        let y = 50; // Start offset
        g.nodes().forEach(id => {
            const node = g.node(id);
            node.x = 200; // Center horizontally on the screen
            node.y = y;
            y += nodeHeight + separation;
        });
        // In a real Dagre implementation, this function calculates proper x/y positions
    }
};

// React Flow Mock Hooks/Components
const useNodesState = (initialNodes) => useState(initialNodes);
const useEdgesState = (initialEdges) => useState(initialEdges);
const ReactFlow = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, fitView, nodeTypes, edgeTypes, onNodeClick, children }) => {
    // Render the nodes and edges based on calculated positions
    return (
        <div style={{ width: '100%', height: 'calc(100vh - 80px)' }}>
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
                    // Simple vertical line for visualization
                    const sourceNode = nodes.find(n => n.id === edge.source);
                    const targetNode = nodes.find(n => n.id === edge.target);

                    if (!sourceNode || !targetNode) return null;
                    
                    const sourceCenter = { x: sourceNode.position.x + 150, y: sourceNode.position.y + 60 };
                    const targetCenter = { x: targetNode.position.x + 150, y: targetNode.position.y };

                    const height = targetCenter.y - sourceCenter.y;
                    const width = 2; // Line width
                    const leftOffset = sourceCenter.x - (width / 2);
                    
                    return (
                        <div key={edge.id} className="flow-edge-style" style={{
                            transform: `translate(${leftOffset}px, ${sourceCenter.y}px)`,
                            height: `${height}px`,
                            width: `${width}px`,
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
const Controls = () => <div className="flow-controls-simulated">Controls</div>;
const Background = () => <div className="flow-background-simulated"></div>;
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
    const g = new dagre.graphlib.Graph();
    
    // Set up the graph layout configuration
    g.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50 }); // Dagre options

    // 1. Add nodes to the graph
    nodes.forEach((node) => {
        // Dagre needs width/height to calculate layout properly
        g.setNode(node.id, { width: 300, height: 60 }); 
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
        
        // Dagre positions nodes from the top-left corner
        // We adjust it for React Flow compatibility (top-left of the node)
        node.position = {
            x: nodeWithLayout.x,
            y: nodeWithLayout.y,
        };

        return node;
    });

    return { layoutedNodes, layoutedEdges: edges };
};
// --- End Dagre and React Flow Simulation Helpers ---


/**
 * Renders the mind map using a graph visualization library (like React Flow)
 * and uses Dagre to compute the node positions.
 * @param {Array<Object>} initialPages - List of raw page data.
 * @param {Array<Object>} initialEdges - List of raw edge data.
 * @param {string | null} selectedPageId - ID of the currently selected page.
 * @param {Function} onPageSelect - Callback when a page is clicked.
 */
const MindMapCanvas = ({ initialPages, initialEdges, selectedPageId, onPageSelect }) => {
    
    // Use safe defaults for props inside useMemo to prevent 'map is undefined' errors
    const safeInitialPages = initialPages || [];
    const safeInitialEdges = initialEdges || [];

    // Convert raw data into React Flow compatible nodes and edges
    const { layoutedNodes, layoutedEdges } = useMemo(() => {
        
        // 1. Map pages to React Flow nodes
        const nodes = safeInitialPages.map(page => ({
            id: page.id,
            data: { label: page.label, ...page.metadata },
            position: { x: 0, y: 0 }, // Placeholder, Dagre will set this
            type: 'default', // Using a default type
        }));
        
        // 2. Map edges to React Flow edges (used for selection/details only, rendered manually below)
        const edges = safeInitialEdges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target,
            label: edge.label,
            // Styling properties for a real React Flow Edge
            type: 'smoothstep', 
            markerEnd: { type: 'arrowclosed' },
            style: { strokeWidth: 2, stroke: '#4f46e5' },
            labelBgStyle: { fill: '#fff', fillOpacity: 0.8 },
            labelStyle: { fill: '#4f46e5', fontWeight: 600 }
        }));

        // 3. Apply Dagre Layout
        return getLayoutedElements(nodes, edges, 'TB'); // 'TB' = Top to Bottom
    }, [safeInitialPages, safeInitialEdges]); // Depend on the safe versions

    const [nodes, setNodes] = useNodesState(layoutedNodes);
    const [edges] = useEdgesState(layoutedEdges); // Edges are static once loaded

    // Highlight selected node
    useEffect(() => {
        // Ensure nodes is an array before mapping
        setNodes(nds => (nds || []).map(node => ({
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

    
    return (
        <div className="mindmap-canvas-container">
            <h1 className="text-3xl font-extrabold text-gray-700 p-4 text-center">MindMap for Application</h1>
            
            {/* The ReactFlow Wrapper takes up 100% of its container */}
            <div className="react-flow-wrapper">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={null} // Simplified, ignoring drag/drop for now
                    onEdgesChange={null}
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