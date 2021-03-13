import * as core from '@actions/core'
import * as fs from "fs";
import { google } from "googleapis";

const androidpublisher = google.androidpublisher('v3');
const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/androidpublisher']
});

// Input property names
const serviceJsonPropertyName = "serviceAccountJsonPlainText";
const packageNamePropertyName = "packageName";
const apkPathPropertyName = "apkFilePath";
const aabPathPropertyName = "aabFilePath";
const trackPropertyName = "track";

// Input values
let serviceAccountJsonRaw: string | undefined;
let packageName: string | undefined;
let apkPath: string | undefined;
let aabPath: string | undefined;
let track: string | undefined;

/**
 * This function is to make sure that the action receives valid inputs. For example it ensures that either apkPath or aabPath is provided.
 * @throws {Error} with an appropriate message depending on what input is missing
 */
export function getAndValidateInputs() {
    // Required variables are automatically validated by actions, if missing getInput will throw an error
    serviceAccountJsonRaw = core.getInput(serviceJsonPropertyName, { required: true });
    packageName = "fm.peremen.android"; //core.getInput(packageNamePropertyName, { required: true });
    apkPath = core.getInput(apkPathPropertyName, { required: false });
    aabPath = core.getInput(aabPathPropertyName, { required: false });
    track = core.getInput(trackPropertyName, { required: false });

    // Any optional inputs should be validated here
    if (!apkPath && !aabPath) {
        throw new Error(`You must provide either '${apkPathPropertyName}' or '${aabPathPropertyName}' to use this action`)
    }

    if (!track) {
        track = "internal"
    }
}

/**
 * This function uses the raw json passed by the user and sets it to the process environment variables.
 */
export function setGoogleCredentials() {
    if (serviceAccountJsonRaw) {
        // TODO: do we need to do this? We can put the json string directly in the environment variables
        const serviceAccountFile = "./serviceAccount.json";
        fs.writeFileSync(serviceAccountFile, serviceAccountJsonRaw, {
            encoding: 'utf8'
        });

        // Ensure that the api can find our service account credentials
        core.exportVariable("GOOGLE_APPLICATION_CREDENTIALS", serviceAccountFile);
    }
}

async function main(): Promise<any> {
    getAndValidateInputs();
    setGoogleCredentials();

    // Acquire an auth client, and bind it to all future calls
    const authClient = await auth.getClient();
    google.options({
        auth: authClient,
    });

    // TODO: does this block need to be tested?
    let res: any; // TODO: add a type to this

    res = await androidpublisher.edits.insert({
        packageName: packageName
    })

    const util = require('util')
    console.log("insert OK: " + util.inspect(res.data, false, null, true))

    const editId = res.data.id

    if(apkPath) {
        res = await androidpublisher.edits.apks.upload({
            packageName: packageName,
            media: {
                mimeType: 'application/octet-stream',
                body: fs.createReadStream(apkPath)
            }
        })
    } else if (aabPath) {
        res = await androidpublisher.edits.bundles.upload({
            packageName: packageName,
            editId: editId,
            media: {
                mimeType: 'application/octet-stream',
                body: fs.createReadStream(aabPath)
            }
        })
    }

    console.log("upload OK: " + util.inspect(res.data, false, null, true))

    const data = res.data
    const versionCode = res.data.versionCode

    res = await androidpublisher.edits.tracks.update({
        packageName: packageName,
        editId: editId,
        track: track,
        requestBody: {
          track: track,
          releases: [
            {
              status: "completed",
              versionCodes: [versionCode]
            }
          ]
        }
    })

    console.log("set track OK: " + util.inspect(res.data, false, null, true))

    res = await androidpublisher.edits.commit({
        packageName: packageName,
        editId: editId
    })

    console.log("commit OK: " + util.inspect(res.data, false, null, true))

    return data;
}

main().then((data) => {
    core.setOutput("versionCode", data.versionCode)
    core.setOutput("sha1", data.sha1)
    core.setOutput("sha256", data.sha256)
}).catch ((e) => {
    core.setFailed(e.message)
})
