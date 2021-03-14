# Internal Testing Uploader
GitHub Action to upload aab/apk to Internal Test Track (internal, alphha, beta etc) on Play console.

## Inputs

### `serviceAccountJsonPlainText`
**Required:** Service account JSON in plain text to authenticate upload request. Note that it should be in the plain text and not in actual JSON file format so we recommend setting it as a GitHub secret and then pass it to input.

### `packageName`
**Required:** Your application's package name(Application ID).

### `apkFilePath`
Path to your application's apk file.

### `aabFilePath`
Path to your application's aab file.

### `track`
Testing track name: internal, alpha, beta etc

## Outputs

### `versionCode`
Version code of the uploaded artifact.

### `sha1`
A sha1 hash of the artifact, encoded as a hex string and matching the output of the sha1sum command.

### `sha256`
A sha256 hash of the artifact, encoded as a hex string and matching the output of the sha256sum command.

## Sample for uploading aab
```yml
uses: rusmonster/internal-app-sharing-action@1.2.0
with:
  serviceAccountJsonPlainText: ${{ secrets.<your-github-service-acc-json-secret> }}
  packageName: <your-package-name>
  aabFilePath: <path-to-aab>
  track: <track>
```

## Sample for uploading apk
```yml
uses: rusmonster/internal-app-sharing-action@1.2.0
with:
  serviceAccountJsonPlainText: ${{ secrets.<your-github-service-acc-json-secret> }}
  packageName: <your-package-name>
  apkFilePath: <path-to-apk>
  track: <track>
```

> Action is taking care of deleting the Service Account JSON file it creates internally so that it won't get compromised for any reason :slightly_smiling_face:.

# License

```
Copyright 2020 Sagar Viradiya

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```
