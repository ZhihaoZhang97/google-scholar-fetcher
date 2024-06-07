# Google Sholar Fetcher
An action to automatically fetch Google Scholar records.

## Inputs
### `google-scholar-id`
**Required** The Google Scholar ID of researcher.

### `record-file`
**Optional** The record json file to write. If this input was given, the output `record` will not be generated.

## Outputs
### `record`
The record string in JSON format. This output only exists when the `record-file` input is not given.

## Example usage
Create two new __repository variables__ in https://github.com/USERNAME/REPOSITORY/settings/variables/actions as follows:

| Name | Description | Example |
|:-:|:-:|:-:|
| GOOGLE_SCHOLAR_ID | Your Google Scholar id. | XXXXXXXXXXXX (In your personal scholar page address, the value of `user` key.) |
| RECORD_FILE | The related path of the works file in your repository. | assets/record.json |

Now you can create an action to auto update your Google Scholar record.

The workflow's code is as follows:
```yaml
name: Update Record

on:
  # Create a scheduled task, in this example we run it at the first day of every month.
  schedule:
    - cron: "0 0 1 * *"
  # Enable manually executing.
  workflow_dispatch:

permissions:
  contents: write
  
jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v4
    
    # Fetch record with Google Scholar ID
    - name: Get record with token
      uses: sxlllslgh/google-scholar-fetcher@v1
      id: record
      with:
        google-scholar-id: ${{ vars.GOOGLE_SCHOLAR_ID }}
        record-file: ${{ vars.RECORD_FILE }}
      
    - name: Make sure the record file is tracked
      run: git add ${{ vars.RECORD_FILE }}

    # If record file changed, return exit code 1, otherwise 0.
    - name: Judge if file changed
      id: changed
      continue-on-error: true
      run: git diff --exit-code ${{ vars.RECORD_FILE }}

    - name: Judge if staged file changed
      id: cached
      continue-on-error: true
      run: git diff --exit-code --cached ${{ vars.RECORD_FILE }}

    - name: Update record
      if: ${{ steps.changed.outcome == 'failure' || steps.cached.outcome == 'failure' }}
      run: |
          git config --global user.name '${{ vars.GIT_USERNAME }}'
          git config --global user.email '${{ vars.GIT_EMAIL }}'
          git commit -am "Automatically update record."
          git push
```

The result is a string (or a file) in JSON format, the description is as follows:
| Name | Description | Type |
|:-:|:-|:-:|
| title | Title of the publication. | String |
| date | Date array of the publication in YYYY-MM-DD order, the array might be incompleted. | Array\<Int> |
| link | Link of the publication. | String |
| authors | Array of authors by the publication order. | Array\<String> |
| journal | Journal/Conference title of the publication. | String |
| volume | Volume of the publication. | String |
| pages | Pages of the publication. | String |
| publisher | Publisher of the publication. | String |
| description | Description of the publication. Generally it is the abstract of a paper, and incompleted. | String |
| citations | Count of citations of the publication. | Int |