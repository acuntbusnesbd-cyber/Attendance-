export interface DriveFolderInfo {
  id: string;
  name: string;
  webViewLink?: string;
}

export interface DriveUploadResult {
  id: string;
  name: string;
  webViewLink: string;
  thumbnailLink?: string;
}

const FOLDER_NAME = 'Attendance Records';

/**
 * Finds or creates the dedicated 'Attendance Records' folder in the user's Google Drive.
 */
export async function getOrCreateAttendanceFolder(accessToken: string): Promise<DriveFolderInfo> {
  const query = encodeURIComponent(
    `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
  );

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink)&pageSize=1`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!searchRes.ok) {
    const errorData = await searchRes.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to search folder: ${searchRes.statusText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return {
      id: searchData.files[0].id,
      name: searchData.files[0].name,
      webViewLink: searchData.files[0].webViewLink,
    };
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files?fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Auto-saved attendance sheet images from Attendance Studio',
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Failed to create folder: ${createRes.statusText}`);
  }

  const folderData = await createRes.json();
  return {
    id: folderData.id,
    name: folderData.name,
    webViewLink: folderData.webViewLink,
  };
}

/**
 * Uploads an attendance card image (data URL or blob) directly to the user's Google Drive folder.
 */
export async function uploadAttendanceImageToDrive(
  accessToken: string,
  imageDataUrl: string,
  fileName: string,
  description?: string
): Promise<DriveUploadResult> {
  // 1. Ensure folder exists
  const folder = await getOrCreateAttendanceFolder(accessToken);

  // 2. Convert DataURL to Blob
  const blobRes = await fetch(imageDataUrl);
  const imageBlob = await blobRes.blob();

  // 3. Construct multipart upload request body
  const boundary = '-------AttendanceStudioBoundary' + Math.random().toString(36).substring(2);
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'image/png',
    parents: [folder.id],
    description: description || 'Attendance Sheet exported from Attendance Studio',
  };

  const multipartBlob = new Blob(
    [
      delimiter,
      'Content-Type: application/json; charset=UTF-8\r\n\r\n',
      JSON.stringify(metadata),
      delimiter,
      'Content-Type: image/png\r\n\r\n',
      imageBlob,
      closeDelimiter,
    ],
    { type: `multipart/related; boundary=${boundary}` }
  );

  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,thumbnailLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: multipartBlob,
    }
  );

  if (!uploadRes.ok) {
    const errorData = await uploadRes.json().catch(() => ({}));
    throw new Error(errorData?.error?.message || `Upload to Drive failed: ${uploadRes.statusText}`);
  }

  const uploadedData = await uploadRes.json();
  return {
    id: uploadedData.id,
    name: uploadedData.name,
    webViewLink: uploadedData.webViewLink || `https://drive.google.com/file/d/${uploadedData.id}/view`,
    thumbnailLink: uploadedData.thumbnailLink,
  };
}

/**
 * Lists backed up files from the user's Attendance Records folder.
 */
export async function listDriveAttendanceFiles(accessToken: string): Promise<Array<{
  id: string;
  name: string;
  webViewLink: string;
  createdTime: string;
  size?: string;
}>> {
  try {
    const folder = await getOrCreateAttendanceFolder(accessToken);
    const query = encodeURIComponent(
      `'${folder.id}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`
    );

    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,webViewLink,createdTime,size)&orderBy=createdTime desc&pageSize=30`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return data.files || [];
  } catch (err) {
    console.error('Failed to list files from Drive:', err);
    return [];
  }
}
