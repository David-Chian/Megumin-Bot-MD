// Credits: OfcKing
// >> https://github.com/OfcKing

import fs from 'fs';

const paths = {
  MeguminJadiBot: './MeguminJadiBot/',
  MeguminSession: './MeguminSession/'
};

function cleanSubbotDirectories() {
  for (const [name, path] of Object.entries(paths)) {
    if (name === 'MeguminSession') continue; // Skip SanSession for this function

    fs.readdir(path, (err, subbotDirs) => {
      if (err) {
        return console.log(`No se puede escanear el directorio ${name}: ` + err);
      }

      let totalFilesDeleted = 0;

      subbotDirs.forEach((subbotDir) => {
        const subbotPath = `${path}${subbotDir}/`;

        fs.readdir(subbotPath, (err, files) => {
          if (err) {
            return console.log(`No se puede escanear el directorio ${subbotPath}: ` + err);
          }

          let filesDeleted = 0;
          const deletePromises = files.map((file) => {
            if (file !== 'creds.json') {
              return new Promise((resolve, reject) => {
                fs.unlink(`${subbotPath}${file}`, (err) => {
                  if (!err || err.code === 'ENOENT') {
                    filesDeleted++;
                    totalFilesDeleted++;
                    resolve();
                  } else {
                    reject(err);
                  }
                });
              });
            }
          });

          Promise.all(deletePromises).then(() => {
            if (filesDeleted > 0) {
              console.log(`Se eliminaron ${filesDeleted} archivos de la sesión Jadibot: ${subbotDir}`);
            }
          }).catch((err) => {
            console.log('Error al eliminar archivos: ' + err);
          });
        });
      });

      if (totalFilesDeleted === 0) {
        console.log(`0 Archivos eliminados en ${name}`);
      } else {
        console.log(`Se eliminaron un total de ${totalFilesDeleted} archivos de todas las sesiones Jadibot en ${name}`);
      }
    });
  }
}

function cleanMeguminSession() {
  const sessionPath = paths.MeguminSession;

  fs.readdir(sessionPath, (err, files) => {
    if (err) {
      return console.log('No se puede escanear el directorio MeguminSession: ' + err);
    }

    let filesDeleted = 0;
    const deletePromises = files.map((file) => {
      if (file !== 'creds.json') {
        return new Promise((resolve, reject) => {
          fs.unlink(`${sessionPath}${file}`, (err) => {
            if (!err || err.code === 'ENOENT') {
              filesDeleted++;
              resolve();
            } else {
              reject(err);
            }
          });
        });
      }
    });

    Promise.all(deletePromises).then(() => {
      if (filesDeleted > 0) {
        console.log(`Se eliminaron ${filesDeleted} archivos de la sesión MeguminSession`);
      } else {
        console.log('0 Archivos eliminados en MeguminSession');
      }
    }).catch((err) => {
      console.log('Error al eliminar archivos: ' + err);
    });
  });
}

function displayNoFilesDeleted() {
  const noFilesDeletedInSessions = [];

  for (const [name, path] of Object.entries(paths)) {
    fs.readdir(path, (err, files) => {
      if (!err && files.length === 1 && files[0] === 'creds.json') {
        noFilesDeletedInSessions.push(name);
      }

      if (noFilesDeletedInSessions.length > 0) {
        console.log(`0 sesiones en: ${noFilesDeletedInSessions.join(', ')}`);
      }
    });
  }
}

setInterval(cleanSubbotDirectories, 60 * 1000);
setInterval(cleanMeguminSession, 60 * 1000);
setInterval(displayNoFilesDeleted, 60 * 1000);

cleanSubbotDirectories();
cleanMeguminSession();
displayNoFilesDeleted();