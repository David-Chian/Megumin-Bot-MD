// Credits: OfcKing
// >> https://github.com/OfcKing

import fs from 'fs';

const paths = {
  MeguminJadiBot: './MeguminJadiBot/',
  MeguminSession: './MeguminSession/'
};

async function cleanSubbotDirectories() {
  let totalFilesDeleted = 0;

  for (const [name, path] of Object.entries(paths)) {
    if (name === 'MeguminSession') continue; // Saltar MeguminSession en esta función

    try {
      const subbotDirs = await fs.promises.readdir(path);
      for (const subbotDir of subbotDirs) {
        const subbotPath = `${path}${subbotDir}/`;

        try {
          const files = await fs.promises.readdir(subbotPath);
          const deletePromises = files
            .filter(file => file !== 'creds.json')
            .map(file => fs.promises.unlink(`${subbotPath}${file}`).then(() => totalFilesDeleted++));

          await Promise.all(deletePromises);
          if (deletePromises.length > 0) {
            console.log(`Se eliminaron ${deletePromises.length} archivos de la sesión Jadibot: ${subbotDir}`);
          }
        } catch (err) {
          console.log(`No se puede escanear el directorio ${subbotPath}: ${err}`);
        }
      }

      console.log(`Se eliminaron un total de ${totalFilesDeleted} archivos de todas las sesiones Jadibot en ${name}`);
    } catch (err) {
      console.log(`No se puede escanear el directorio ${name}: ${err}`);
    }
  }
}

async function cleanMeguminSession() {
  const sessionPath = paths.MeguminSession;

  try {
    const files = await fs.promises.readdir(sessionPath);
    const deletePromises = files
      .filter(file => file !== 'creds.json')
      .map(file => fs.promises.unlink(`${sessionPath}${file}`));

    await Promise.all(deletePromises);
    console.log(`Se eliminaron ${deletePromises.length} archivos de la sesión MeguminSession`);
  } catch (err) {
    console.log('No se puede escanear el directorio MeguminSession: ' + err);
  }
}

async function displayNoFilesDeleted() {
  const noFilesDeletedInSessions = [];

  for (const [name, path] of Object.entries(paths)) {
    try {
      const files = await fs.promises.readdir(path);
      if (files.length === 1 && files[0] === 'creds.json') {
        noFilesDeletedInSessions.push(name);
      }
    } catch (err) {
      console.log(`Error al escanear ${name}: ${err}`);
    }
  }

  if (noFilesDeletedInSessions.length > 0) {
    console.log(`0 sesiones activas en: ${noFilesDeletedInSessions.join(', ')}`);
  }
}

cleanSubbotDirectories();
cleanMeguminSession();
displayNoFilesDeleted();

setInterval(cleanSubbotDirectories, 60 * 1000);
setInterval(cleanMeguminSession, 60 * 1000);
setInterval(displayNoFilesDeleted, 60 * 1000);