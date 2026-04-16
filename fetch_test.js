async function getURL() { 
  const response = await fetch('https://scrunchcreate.vercel.app/'); 
  const text = await response.text(); 
  const m = text.match(/src="(\/assets\/index-[^"]+\.js)"/); 
  if (m) { 
    const jsRes = await fetch('https://scrunchcreate.vercel.app' + m[1]); 
    const jsText = await jsRes.text(); 
    const apiMatch = jsText.match(/https:\/\/[A-Za-z0-9-]+\.onrender\.com[A-Za-z0-9/-]*/g); 
    console.log("Found in JS:", apiMatch ? Array.from(new Set(apiMatch)) : "None"); 
  } else { 
    console.log('No JS bundle found in HTML', text.substring(0,200)); 
  } 
} 
getURL().catch(console.error);
