/**
 * src/api/mindmapApi.js
 * API calls to backend (simulated with mock data)
 * Note: x, y coordinates are removed as Dagre will calculate positions.
 */

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

/**
 * Fetches mind map data (pages and edges).
 * Simulates network delay with a Promise.
 * @returns {Promise<{pages: Array<Object>, edges: Array<Object>}>}
 */
export const fetchMindMapData = () => {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log("Mind map data fetched.");
            resolve(mockData);
        }, 800);
    });
};