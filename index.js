const core = require('@actions/core');
const fsp = require('fs/promises');
const parse = require('node-html-parser').parse;

async function fetchRange(start, end) {
    const publications = [];
    const record = await fetch(`https://scholar.google.com/citations?user=${core.getInput('google-scholar-id')}&cstart=${start}&pagesize=${end}`, {method: 'POST', body: 'json=1'});
    const recordJson = await record.json();
    const recordHTML = recordJson.B;
    const dom = parse(recordHTML);
    for (const row of dom.childNodes) {
        const detailedRecord = await fetch(`https://scholar.google.com/citations?view_op=view_citation&hl=en&user=${core.getInput('google-scholar-id')}&citation_for_view=${core.getInput('google-scholar-id')}:${row.childNodes[0].childNodes[0].getAttribute('href').split(':')[1]}`);
        const detailedRecordHTML = await detailedRecord.text();
        const detailedRecordDom = parse(detailedRecordHTML);
        const detailedRecordInfo = detailedRecordDom.getElementById('gsc_oci_table');
        const detailedRecordJson = {'title': detailedRecordDom.getElementById('gsc_oci_title').childNodes[0].innerHTML, 'link': detailedRecordDom.getElementById('gsc_oci_title').childNodes[0].getAttribute('href')}
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
            fsp.writeFile(recordFile, JSON.stringify(totalPublications));
        } else {
            core.setOutput('record', JSON.stringify(totalPublications));
        }
    } catch (error) {
        core.setFailed(error.message);
    }
}

fetchRecord().finally();