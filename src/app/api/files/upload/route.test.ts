import { POST } from './route';
import { NextRequest } from 'next/server';
import fs from 'fs';
import path from 'path';

async function runTest() {
    console.log("Running test for file upload API...");

    // Create a dummy file to upload
    const filePath = path.join(process.cwd(), 'uploads', 'test.txt');
    fs.writeFileSync(filePath, 'This is a test file.');

    const file = fs.createReadStream(filePath);

    // Create a mock request with the file
    const formData = new FormData();
    formData.append('file', new Blob([fs.readFileSync(filePath)]), 'test.txt');

    const request = new NextRequest('http://localhost/api/files/upload', {
        method: 'POST',
        body: formData,
    });

    const response = await POST(request);
    const result = await response.json();

    console.log("Result:", result);

    if (response.status === 200 && result.filepath) {
        console.log("Test Case 1 PASSED");
        // Clean up the created file
        fs.unlinkSync(result.filepath);
    } else {
        console.error("Test Case 1 FAILED");
    }
}

runTest();
