const apiKey = 'AIzaSyCC7qSF7ed7kLfRNkumv2hENUxvX3vvn4s';
const models = ['gemini-2.5-flash', 'gemini-2.0-flash-lite', 'gemini-flash-latest'];
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
