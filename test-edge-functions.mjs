const supabaseUrl = 'https://lbxjsemcruizsxglfesw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxieGpzZW1jcnVpenN4Z2xmZXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE4NjA1NDgsImV4cCI6MjA4NzQzNjU0OH0.QsJ1vIrrNALskyX3Sp2wCmHeGBXcQSDDp5qZn0zZ1OA';

// Small 1x1 black pixel base64 for testing
const testImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

async function testFunctions() {
    console.log('--- Testing analyze-face ---');
    try {
        const faceResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-face`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'apikey': supabaseKey
            },
            body: JSON.stringify({ imageBase64: testImage })
        });

        console.log(`analyze-face status: ${faceResponse.status} ${faceResponse.statusText}`);
        const faceData = await faceResponse.text();
        console.log('analyze-face response:', faceData.substring(0, 500));
    } catch (error) {
        console.error('analyze-face failed:', error);
    }

    console.log('\n--- Testing analyze-health ---');
    // Note: analyze-health requires Auth, so we expect a 401/403 if not logged in
    try {
        const healthResponse = await fetch(`${supabaseUrl}/functions/v1/analyze-health`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'apikey': supabaseKey
            }
        });

        console.log(`analyze-health status: ${healthResponse.status} ${healthResponse.statusText}`);
        const healthData = await healthResponse.text();
        console.log('analyze-health response:', healthData.substring(0, 500));
    } catch (error) {
        console.error('analyze-health failed:', error);
    }
}

testFunctions();
