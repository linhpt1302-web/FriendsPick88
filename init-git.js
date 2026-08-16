import git from 'isomorphic-git';
import fs from 'fs';
import path from 'path';

async function initRepo() {
  const dir = process.cwd();
  console.log('Initializing git repository at', dir);

  // 1. git init
  await git.init({ fs, dir, defaultBranch: 'main' });
  console.log('Initialized empty Git repository in', path.join(dir, '.git'));

  // 2. Collect files to add (ignoring node_modules, dist, .git)
  function getFiles(currentDir, relativePath = '') {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    let files = [];

    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.git') {
        continue;
      }
      const fullPath = path.join(currentDir, entry.name);
      const rel = relativePath ? `${relativePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        files = files.concat(getFiles(fullPath, rel));
      } else {
        files.push(rel);
      }
    }
    return files;
  }

  const filesToAdd = getFiles(dir);
  console.log(`Staging ${filesToAdd.length} files...`);

  for (const filepath of filesToAdd) {
    await git.add({ fs, dir, filepath });
  }

  // 3. Initial commit
  const sha = await git.commit({
    fs,
    dir,
    author: {
      name: 'Friends Pickleball Club',
      email: 'admin@friendspickleball.com'
    },
    message: 'Initial commit: Friends Pickleball Club web platform'
  });

  console.log('Created initial commit:', sha);
  console.log('Git init and initial commit completed successfully!');
}

initRepo().catch(err => {
  console.error('Error initializing git repo:', err);
  process.exit(1);
});
