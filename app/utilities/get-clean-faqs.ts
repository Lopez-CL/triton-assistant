import 'dotenv/config'
export async function getFAQs(){
    const baseUrl: string = 'https://ucsd.libanswers.com/api/1.1'
    const endpoint = '/faqs';
    try{
    const authRes = await fetch(`${baseUrl}/oauth/token`,{
        method: 'POST',
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: new URLSearchParams({
            'client_id': process.env.CLIENT_ID || '',
            'client_secret': process.env.LIBANSW_KEY||'',
            'grant_type': 'client_credentials'
        })
    })
    if(!authRes.ok) throw new Error('Issue with authentication process')
    const {access_token} = await authRes.json();
    // const access_token = '';
    console.log(access_token);
    const rawFAQs = await fetch(`${baseUrl}${endpoint}?limit=1`,{
        method:'GET',
        headers:{
            'Authorization':`Bearer ${access_token}`,
            'Accept': 'application/json'
        }
    })
    const jsonFAQs = await rawFAQs.json()
    console.log(JSON.stringify(jsonFAQs,null,2))
    }catch(error){console.log(error,"Issue with LibApps api call")}
}

getFAQs();