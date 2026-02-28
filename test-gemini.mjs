const apiKey = 'AIzaSyCcQk6281y1Wju4VdLpC1avhYtz-GVLn8o';
const model1 = 'gemini-1.5-flash';
const model2 = 'gemini-2.0-flash';

async function verify(model) {
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: "Hello" }] }] })
        });
        console.log(`Model ${model}: ${res.status} ${res.statusText}`);
        const text = await res.text();
        console.log(`Body: ${text.substring(0, 100)}...`);
    } catch (e) {
        console.error(e);
    }
}

async function run() {
    await verify(model1);
    await verify(model2);
}

run();
