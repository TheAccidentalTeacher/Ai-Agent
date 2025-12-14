/**
 * Multi-Agent API Client
 * Sprint 3: Frontend integration with backend multi-agent orchestration
 * 
 * Provides utilities to call the multi-agent API endpoint and handle responses
 */

class MultiAgentClient {
  constructor(apiBaseUrl = '/api') {
    this.apiBaseUrl = apiBaseUrl;
    this.endpoint = `${apiBaseUrl}/multi-agent`;
  }

  /**
   * Execute a multi-agent workflow
   * 
   * @param {string} question - The question to discuss
   * @param {string} mode - 'panel', 'consensus', or 'debate'
   * @param {string[]} personas - Optional array of persona names to use
   * @returns {Promise<object>} Response with synthesis and individual responses
   */
  async executeWorkflow(question, mode = 'panel', personas = null) {
    try {
      console.log(`🤖 Multi-Agent Request: ${mode} mode`);
      console.log(`   Question: ${question.substring(0, 100)}...`);
      
      const payload = {
        question,
        mode,
        ...(personas && { personas })
      };

      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Unknown error');
      }

      console.log(`✅ Multi-Agent Response received`);
      console.log(`   Mode: ${data.data.mode}`);
      console.log(`   Agents: ${data.data.personas.join(', ')}`);
      console.log(`   Time: ${data.data.metadata.executionTime}ms`);

      return data.data;

    } catch (error) {
      console.error('❌ Multi-Agent API Error:', error);
      throw error;
    }
  }

  /**
   * Execute a panel discussion
   * 
   * @param {string} question - The question to discuss
   * @param {string[]} personas - Optional personas for the panel
   * @returns {Promise<object>} Panel discussion results
   */
  async panelDiscussion(question, personas = null) {
    return this.executeWorkflow(question, 'panel', personas);
  }

  /**
   * Execute consensus voting
   * 
   * @param {string} question - The question to vote on
   * @param {string[]} personas - Optional personas for voting
   * @returns {Promise<object>} Consensus results
   */
  async consensusVoting(question, personas = null) {
    return this.executeWorkflow(question, 'consensus', personas);
  }

  /**
   * Execute a debate
   * 
   * @param {string} question - The question to debate
   * @param {string[]} personas - Optional personas for debate
   * @returns {Promise<object>} Debate results
   */
  async debate(question, personas = null) {
    return this.executeWorkflow(question, 'debate', personas);
  }

  /**
   * Format response for display
   * 
   * @param {object} data - Response data from API
   * @returns {object} Formatted response for UI
   */
  formatForDisplay(data) {
    return {
      question: data.question,
      mode: data.mode.charAt(0).toUpperCase() + data.mode.slice(1),
      personas: data.personas,
      synthesis: data.synthesis,
      responses: data.responses,
      timing: {
        executionTime: `${data.metadata.executionTime}ms`,
        timestamp: new Date(data.metadata.timestamp).toLocaleString()
      }
    };
  }
}

// Export for use in modules or create global if in browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MultiAgentClient;
}

// Make available globally in browser
if (typeof window !== 'undefined') {
  window.MultiAgentClient = MultiAgentClient;
}
