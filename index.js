const core = require('@actions/core');
const fsp = require('fs/promises');
const parse = require('node-html-parser').parse;

// Common headers to make requests appear more like a browser
const fetchHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
};

async function fetchRange(start, end) {
    const publications = [];
    
    try {
        // Adding delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const record = await fetch(`https://scholar.google.com/citations?user=${core.getInput('google-scholar-id')}&cstart=${start}&pagesize=${end}`, {
            method: 'POST', 
            body: 'json=1',
            headers: fetchHeaders
        });
        
        if (!record.ok) {
            throw new Error(`Failed to fetch publications: ${record.status} ${record.statusText}`);
        }
        
        const recordJson = await record.json();
        const recordHTML = recordJson.B;
        const dom = parse(recordHTML);
        
        for (const row of dom.childNodes) {
            // Adding delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const citationId = row.childNodes[0].childNodes[0].getAttribute('href').split(':')[1];
            const detailedRecord = await fetch(`https://scholar.google.com/citations?view_op=view_citation&hl=en&user=${core.getInput('google-scholar-id')}&citation_for_view=${core.getInput('google-scholar-id')}:${citationId}`, {
                headers: fetchHeaders
            });
            
            if (!detailedRecord.ok) {
                console.warn(`Warning: Failed to fetch detailed record: ${detailedRecord.status} ${detailedRecord.statusText}`);
                continue;
            }
            
            const detailedRecordHTML = await detailedRecord.text();
            const detailedRecordDom = parse(detailedRecordHTML);
            const detailedRecordInfo = detailedRecordDom.getElementById('gsc_oci_table');
            
            if (!detailedRecordDom.getElementById('gsc_oci_title')) {
                console.warn('Warning: Unable to parse publication title');
                continue;
            }
            
            const detailedRecordJson = {
                'title': detailedRecordDom.getElementById('gsc_oci_title').childNodes[0].innerHTML,
                'link': detailedRecordDom.getElementById('gsc_oci_title').childNodes[0].getAttribute('href')
            };
            
            // Rest of the parsing logic remains the same
            for (const detailedRecordInfoItem of detailedRecordInfo.childNodes) {
                switch (detailedRecordInfoItem.childNodes[0].innerHTML) {
                    case 'Authors':
                        detailedRecordJson['authors'] = detailedRecordInfoItem.childNodes[1].innerHTML.split(', ');
                        break;
                    case 'Publication date':
                        detailedRecordJson['date'] = detailedRecordInfoItem.childNodes[1].innerHTML.split('/').map(element => parseInt(element));
                        break;
                    case 'Journal':
                        detailedRecordJson['journal'] = detailedRecordInfoItem.childNodes[1].innerHTML;
                        break;
                    case 'Conference':
                        detailedRecordJson['journal'] = detailedRecordInfoItem.childNodes[1].innerHTML;
                        break;
                    case 'Volume':
                        detailedRecordJson['volume'] = detailedRecordInfoItem.childNodes[1].innerHTML;
                        break;
                    case 'Pages':
                        detailedRecordJson['pages'] = detailedRecordInfoItem.childNodes[1].innerHTML;
                        break;
                    case 'Publisher':
                        detailedRecordJson['publisher'] = detailedRecordInfoItem.childNodes[1].innerHTML;
                        break;
                    case 'Description':
                        detailedRecordJson['description'] = detailedRecordInfoItem.childNodes[1].innerHTML.replaceAll(/(<([^>]+)>)/ig, '');;
                        break;
                    case 'Total citations':
                        detailedRecordJson['citations'] = parseInt(detailedRecordInfoItem.childNodes[1].childNodes[0].childNodes[0].innerHTML.match(/\d+/g)[0]);
                        break;
                }
            }
            publications.push(detailedRecordJson);
        }
    } catch (error) {
        console.error(`Error in fetchRange: ${error.message}`);
        throw error;
    }
    
    return publications;
}

async function fetchRecord(start = 0, step = 100) {
    try {
        var totalPublications = [];
        var start = 0, end = step;
        while (true) {
            var pagePublications = await fetchRange(start, end);
            totalPublications = totalPublications.concat(pagePublications);
            if (pagePublications.length < step) {
                break;
            } else {
                start += step;
                end += step;
            }
        }
        
        const recordFile = core.getInput('record-file');
        if (recordFile != '') {
            await fsp.writeFile(recordFile, JSON.stringify(totalPublications));
            console.log(`Successfully wrote ${totalPublications.length} publications to ${recordFile}`);
        } else {
            core.setOutput('record', JSON.stringify(totalPublications));
            console.log(`Successfully fetched ${totalPublications.length} publications`);
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

fetchRecord().finally();
