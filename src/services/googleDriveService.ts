import { getAccessToken } from './firebaseAuth';

export interface DriveDatabaseFile {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

export interface AppDatabasePayload {
  app: string;
  version: string;
  exportedAt: string;
  userEmail: string;
  data: {
    userProfile: any;
    meals: any[];
    waterRecords: any;
    healthRecords: any[];
    customFoods: any[];
    favoriteMeals: any[];
    customExercises: any[];
    activeDietPlan: any;
    nutritionalAssessment: any;
    stepsToday: number;
    stepGoal: number;
    userCoins: number;
    unlockedItems: string[];
    weightHistory: any[];
  };
}

const DB_FILENAME = 'metafitquest_database_sync.json';
const FOLDER_NAME = 'MetaFitQuest_Database';

/**
 * Procura ou cria a pasta MetaFitQuest_Database no Google Drive do usuário
 */
async function getOrCreateAppFolder(token: string): Promise<string> {
  const query = encodeURIComponent(`name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!searchRes.ok) {
    throw new Error(`Falha ao buscar pasta no Google Drive (${searchRes.statusText})`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Criar pasta
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
    }),
  });

  if (!createRes.ok) {
    throw new Error('Falha ao criar pasta MetaFitQuest no Google Drive');
  }

  const createdFolder = await createRes.json();
  return createdFolder.id;
}

/**
 * Salva ou atualiza o banco de dados completo do app no Google Drive
 */
export async function saveDatabaseToGoogleDrive(payload: AppDatabasePayload): Promise<{ fileId: string; modifiedTime: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Autenticação com Google Drive necessária.');
  }

  const folderId = await getOrCreateAppFolder(token);

  // Verificar se o arquivo metafitquest_database_sync.json já existe na pasta
  const query = encodeURIComponent(`name = '${DB_FILENAME}' and '${folderId}' in parents and trashed = false`);
  const existingRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const existingData = await existingRes.json();
  const fileContent = JSON.stringify(payload, null, 2);
  const blob = new Blob([fileContent], { type: 'application/json' });

  if (existingData.files && existingData.files.length > 0) {
    const existingFile = existingData.files[0];
    // Atualiza arquivo existente via multipart ou PATCH upload
    const updateRes = await fetch(
      `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}?uploadType=media`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: blob,
      }
    );

    if (!updateRes.ok) {
      throw new Error('Erro ao atualizar banco de dados no Google Drive.');
    }

    const updated = await updateRes.json();
    return { fileId: existingFile.id, modifiedTime: new Date().toISOString() };
  } else {
    // Criar novo arquivo usando multipart upload
    const metadata = {
      name: DB_FILENAME,
      mimeType: 'application/json',
      parents: [folderId],
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!createRes.ok) {
      throw new Error('Erro ao criar arquivo de banco de dados no Google Drive.');
    }

    const created = await createRes.json();
    return { fileId: created.id, modifiedTime: new Date().toISOString() };
  }
}

/**
 * Lê o banco de dados armazenado no Google Drive
 */
export async function loadDatabaseFromGoogleDrive(): Promise<AppDatabasePayload | null> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Autenticação com Google Drive necessária.');
  }

  const folderId = await getOrCreateAppFolder(token);
  const query = encodeURIComponent(`name = '${DB_FILENAME}' and '${folderId}' in parents and trashed = false`);
  const searchRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,size)`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!searchRes.ok) {
    throw new Error('Falha ao verificar arquivo no Google Drive.');
  }

  const data = await searchRes.json();
  if (!data.files || data.files.length === 0) {
    return null;
  }

  const fileId = data.files[0].id;
  const contentRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!contentRes.ok) {
    throw new Error('Falha ao baixar conteúdo do banco de dados.');
  }

  const dbPayload: AppDatabasePayload = await contentRes.json();
  return dbPayload;
}

/**
 * Exporta backup pontual com timestamp
 */
export async function createDatabaseSnapshot(payload: AppDatabasePayload): Promise<string> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Autenticação com Google Drive necessária.');
  }

  const folderId = await getOrCreateAppFolder(token);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const snapshotName = `metafitquest_backup_${timestamp}.json`;
  const fileContent = JSON.stringify(payload, null, 2);

  const metadata = {
    name: snapshotName,
    mimeType: 'application/json',
    parents: [folderId],
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    throw new Error('Erro ao salvar snapshot de backup.');
  }

  const created = await res.json();
  return created.id;
}
