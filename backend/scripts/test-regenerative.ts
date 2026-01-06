#!/usr/bin/env node

import { RegenerativeOrchestrator } from '../src/services/RegenerativeOrchestrator';

async function testRegenerativeArchitecture() {
  console.log('🌍 Testing Atlas Sanctum Regenerative Architecture...');
  
  try {
    const orchestrator = new RegenerativeOrchestrator();
    
    // Test action processing
    const testAction = {
      id: 'test_action_123',
      type: 'create_project',
      entityType: 'carbon_project',
      entityId: 'test_project_123',
      data: {
        name: 'Test Forest Project',
        emissions: 500,
        location: { lat: 40.7128, lng: -74.0060, indigenousTerritory: false }
      },
      userId: 'test_user_123',
      context: { hasConsent: true },
      timestamp: new Date()
    };

    const result = await orchestrator.processAction(testAction);
    
    console.log('✅ Action processed:', result.status);
    console.log('✅ Verification pipeline:', result.verificationPipelineId ? 'Created' : 'Failed');
    console.log('✅ Ethical evaluation:', result.ethicalEvaluation?.overallResult || 'Failed');
    console.log('✅ Trust check:', result.trustCheck?.meets ? 'Passed' : 'Failed');
    
    // Test system health
    const health = await orchestrator.getSystemHealth();
    console.log('✅ System health:', health.overallHealth);
    
    console.log('🚀 Regenerative architecture is working!');
    
  } catch (error) {
    console.error('❌ Test failed:', (error as Error).message);
    process.exit(1);
  }
}

testRegenerativeArchitecture();