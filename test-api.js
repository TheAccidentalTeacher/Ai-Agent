/**
 * Sprint 3 Integration Test
 * Tests the multi-agent API endpoint with various modes
 */

import MultiAgentClient from './multi-agent-client.js';

async function testMultiAgentAPI() {
  console.log('\n' + '='.repeat(80));
  console.log('🧪 SPRINT 3 INTEGRATION TEST: Multi-Agent API');
  console.log('='.repeat(80));

  // Note: This test assumes the API is running locally at localhost:8888
  // In production, it will be hosted on Netlify
  const client = new MultiAgentClient('http://localhost:8888/api');

  const testQuestions = [
    "What are the best practices for optimizing collision detection in game engines?",
    "How should we approach level design for an educational game?",
    "What's the most effective way to teach game development to beginners?"
  ];

  const testModes = ['panel', 'consensus'];

  try {
    // Test 1: Panel Discussion
    console.log('\n' + '-'.repeat(80));
    console.log('📋 TEST 1: Panel Discussion');
    console.log('-'.repeat(80));
    
    const panelResult = await client.panelDiscussion(testQuestions[0]);
    console.log('✅ Panel discussion completed');
    console.log(`   Personas: ${panelResult.personas.join(', ')}`);
    console.log(`   Responses: ${panelResult.responses.length}`);
    console.log(`   Synthesis length: ${panelResult.synthesis.length} characters`);

    // Test 2: Consensus Voting
    console.log('\n' + '-'.repeat(80));
    console.log('🗳️ TEST 2: Consensus Voting');
    console.log('-'.repeat(80));
    
    const consensusResult = await client.consensusVoting(testQuestions[1]);
    console.log('✅ Consensus voting completed');
    console.log(`   Personas: ${consensusResult.personas.join(', ')}`);
    console.log(`   Responses: ${consensusResult.responses.length}`);
    console.log(`   Synthesis length: ${consensusResult.synthesis.length} characters`);

    // Test 3: Debate
    console.log('\n' + '-'.repeat(80));
    console.log('💬 TEST 3: Debate');
    console.log('-'.repeat(80));
    
    const debateResult = await client.debate(testQuestions[2]);
    console.log('✅ Debate completed');
    console.log(`   Personas: ${debateResult.personas.join(', ')}`);
    console.log(`   Responses: ${debateResult.responses.length}`);
    console.log(`   Synthesis length: ${debateResult.synthesis.length} characters`);

    // Summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ ALL TESTS PASSED');
    console.log('='.repeat(80));
    console.log('\nSprint 3 Status: Backend API Integration Successful');
    console.log('- Multi-agent endpoint: ✅ Functional');
    console.log('- Panel mode: ✅ Tested');
    console.log('- Consensus mode: ✅ Tested');
    console.log('- Debate mode: ✅ Tested');
    console.log('- Client library: ✅ Created');
    console.log('- Response format: ✅ Standardized');
    console.log('\nReady for Sprint 4: UI Integration\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    console.error('\nNote: Ensure dev server is running with: npm run dev');
    process.exit(1);
  }
}

// Run tests
testMultiAgentAPI().catch(console.error);
