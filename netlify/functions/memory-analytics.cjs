/**
 * Memory Analytics API
 * Phase 10 Week 4: Calculate and return memory analytics
 * 
 * Returns:
 * - Total counts (memories, connections, tags)
 * - Type distribution (pie chart data)
 * - Timeline (memory creation over time)
 * - Top topics/tags (bar chart data)
 * - Connection matrix (heatmap data)
 * - Activity patterns (time of day heatmap)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function handler(event, context) {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Get user ID from query params or use demo user
        const userId = event.queryStringParameters?.userId || 'demo-user';

        console.log(`📊 Calculating analytics for user: ${userId}`);

        // 1. Fetch all memories for this user
        const { data: memories, error: memoriesError } = await supabase
            .from('user_memories')
            .select('*')
            .eq('user_id', userId);

        if (memoriesError) {
            throw new Error(`Memories fetch failed: ${memoriesError.message}`);
        }

        // 2. Fetch all connections
        const { data: connections, error: connectionsError } = await supabase
            .from('memory_connections')
            .select('*')
            .or(`source_memory_id.in.(${memories.map(m => m.id).join(',')}),target_memory_id.in.(${memories.map(m => m.id).join(',')})`);

        if (connectionsError) {
            console.warn('⚠️ Connections fetch failed:', connectionsError.message);
        }

        // 3. Calculate analytics
        const analytics = calculateAnalytics(memories, connections || []);

        console.log('✅ Analytics calculated:', {
            totalMemories: analytics.totalMemories,
            totalConnections: analytics.totalConnections,
            uniqueTags: analytics.uniqueTags
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(analytics)
        };

    } catch (error) {
        console.error('❌ Analytics error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Failed to calculate analytics',
                details: error.message
            })
        };
    }
}

/**
 * Calculate all analytics from memory and connection data
 */
function calculateAnalytics(memories, connections) {
    // Quick stats
    const totalMemories = memories.length;
    const totalConnections = connections.length;

    // Extract all tags
    const allTags = memories.flatMap(m => m.tags || []);
    const uniqueTags = [...new Set(allTags)].length;

    // Days active (first to last memory)
    const dates = memories.map(m => new Date(m.created_at)).sort((a, b) => a - b);
    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];
    const daysActive = firstDate && lastDate 
        ? Math.ceil((lastDate - firstDate) / (1000 * 60 * 60 * 24)) + 1
        : 1;

    // Type distribution (for pie chart)
    const typeDistribution = memories.reduce((acc, m) => {
        const type = m.content_type || 'Manual';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {});

    // Timeline (last 30 days)
    const timeline = generateTimeline(memories, 30);

    // Top topics/tags (for bar chart)
    const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
    }, {});

    const topTopics = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 20);

    // Connection matrix (for heatmap)
    const connectionMatrix = calculateConnectionMatrix(memories, connections);

    // Activity by hour (for time of day heatmap)
    const activityByHour = calculateActivityByHour(memories);

    return {
        totalMemories,
        totalConnections,
        uniqueTags,
        daysActive,
        typeDistribution,
        timeline,
        topTopics,
        connectionMatrix,
        activityByHour
    };
}

/**
 * Generate timeline of memory creation for last N days
 */
function generateTimeline(memories, days = 30) {
    const now = new Date();
    const timeline = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];

        const count = memories.filter(m => {
            const memDate = m.created_at.split('T')[0];
            return memDate === dateStr;
        }).length;

        timeline.push({
            date: dateStr,
            count
        });
    }

    return timeline;
}

/**
 * Calculate connection matrix showing which types connect most
 */
function calculateConnectionMatrix(memories, connections) {
    const matrix = {};

    // Create memory type lookup
    const memoryTypes = memories.reduce((acc, m) => {
        acc[m.id] = m.content_type || 'Manual';
        return acc;
    }, {});

    // Count connections between types
    connections.forEach(conn => {
        const sourceType = memoryTypes[conn.source_memory_id];
        const targetType = memoryTypes[conn.target_memory_id];

        if (sourceType && targetType) {
            const key = `${sourceType}-${targetType}`;
            matrix[key] = (matrix[key] || 0) + 1;

            // Also count reverse (undirected)
            const reverseKey = `${targetType}-${sourceType}`;
            matrix[reverseKey] = (matrix[reverseKey] || 0) + 1;
        }
    });

    return matrix;
}

/**
 * Calculate activity by hour of day (0-23)
 */
function calculateActivityByHour(memories) {
    const hourCounts = Array(24).fill(0);

    memories.forEach(m => {
        const date = new Date(m.created_at);
        const hour = date.getHours();
        hourCounts[hour]++;
    });

    return hourCounts;
}
module.exports = { handler };