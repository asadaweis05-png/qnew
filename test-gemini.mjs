// IMPORTANT: Never hardcode API keys in source files!
// Set via environment variable: $env:GOOGLE_API_KEY = "your-key-here"
const apiKey = process.env.GOOGLE_API_KEY;
if (!apiKey) {
    console.error('ERROR: GOOGLE_API_KEY environment variable is not set.');
    console.error('Run: $env:GOOGLE_API_KEY = "your-api-key"  before running this script.');
    process.exit(1);
}
const models = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'];
const versions = ['v1', 'v1beta'];

async function verify(version, model) {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/${version}/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
        });
        console.log(`${version} ${model}: ${res.status} ${res.statusText}`);
        const text = await res.text();
        if (res.ok) {
            console.log(`SUCCESS!`);
        } else {
            console.log(`Error: ${text.substring(0, 100)}`);
        }
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    for (const v of versions) {
        for (const m of models) {
            await verify(v, m);
        }
    }
}

run();
