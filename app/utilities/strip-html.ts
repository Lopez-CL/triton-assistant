export function cleanHtmlForEmbed(html:string):string{
    let text = html;
    // Step 1 Remove block-level tags with spaces
    text = text.replace(/<(br|li|ul|ol|p|div)[^>]*>/gi,' ');
    text = text.replace(/<\/(br|li|ul|ol|p|div)>/gi,' ');
    
    // Step 2 Remove remaining html tags
    text = text.replace(/<[^>]*>/g,'');
    
    //Step 3 Decode common HTML entities
    text = text.replace(/&amp;/g,'&');
    text = text.replace(/&gt;/g,'>');
    text = text.replace(/&lt;/g,'<');
    text = text.replace(/&nbsp;/g,' ');
    text = text.replace(/&quot;/g,'"');
    text = text.replace(/(&rsquo;|&#39;|&apos;)/g,"'");
    text = text.replace(/&ndash;/g,'-');
    
    //Step 4 Clean Up Whitespace
    text = text.replace(/\r\n/g,' ');
    text = text.replace(/\n/g,' ');
    text = text.replace(/\s+/g,' ');
    text = text.trim();

    return text;
}