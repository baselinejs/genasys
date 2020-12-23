import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import degit from 'degit';
import replaceInFiles from 'replace-in-files';
import execa from 'execa';
import fs from 'fs';
import chalk from 'chalk';

const argv = yargs(hideBin(process.argv))
  .scriptName('genasys')
  .command({
    command: '$0 <system> [options]',
    aliases: ['generate', 'gen'],
    describe: 'Generate a Javascript System from a baseline git repo',
    builder: (yargs) => {
      return yargs
        .positional('system', {
          describe:
            'The name of the Javascript system to generate from the specified baseline',
          type: 'string'
        })
        .options({
          baseline: {
            describe:
              'Baseline to use in generating the system. From github:/baselinejs/',
            type: 'string',
            demandOption: true,
            alias: 'b'
          },
          verbose: {
            alias: 'v',
            default: false
          }
        });
    },
    handler: (argv) => {
      generateSystem(argv);
    }
  })
  .command({
    command: 'list <match>',
    aliases: ['search', 'find'],
    describe: 'List available baseline repos',
    builder: (yargs) => yargs.default('match', '*'),
    handler: (argv) => {
      console.log(`Listing baseline repositories matching ${argv.match}`);
    }
  })
  // provide a minimum demand and a minimum demand message
  .demandCommand(1, 'You need at least one command before moving on')
  .help().argv;

function generateSystem(argv) {
  let org: string, repo: string, baselineUrl: string;
  const parts = argv.baseline.split('/');

  if (parts.length < 2) {
    org = 'baselinejs';
    repo = parts[0];
  } else {
    org = parts[0];
    repo = parts[1];
  }

  baselineUrl = `${org}/${repo}`;

  console.info(
    `${chalk.bold('Generating Javascript System')}: '${chalk.cyan(
      argv.system
    )}'\n    from baseline: '${chalk.green(
      repo
    )}'\n    baseline origin: '${chalk.green(org)}' ${chalk.dim(
      '(Github Organization)'
    )}`
  );

  console.log(`\n${chalk.cyan('>>>')} ${chalk.green('degit ' + baselineUrl)}`);

  const emitter = degit(baselineUrl, {
    cache: false,
    force: true,
    verbose: true
  });

  emitter.on('info', (info) => {
    console.info(info.message);
  });

  emitter.clone(argv.system).then(() => {
    console.info('Baseline cloning complete.  Updating system names.');
    process.chdir(`./${argv.system}`);
    replaceInFiles({
      files: ['package.json', 'README.md'],
      from: repo,
      to: argv.system
    })
      .then(() =>
        renameFile(`${repo}.code-workspace`, `${argv.system}.code-workspace`)
      )
      .then(() => {
        console.log('Success!');
        // Check for Yarn first
        fs.promises
          .access('./yarn.lock', fs.constants.F_OK)
          .then(() => bash('yarn install'))
          .then(() => bash('yarn test'))
          .catch(() => {
            fs.promises
              .access('./package.lock', fs.constants.F_OK)
              .then(() => bash('npm install'))
              .then(() => bash('npm run test'))
              .catch((err) => {
                console.error(
                  'Only Yarn and NPM package managers are currently supported, and neither appears to be used in the baseline.'
                );
              });
          });
      })
      .catch((err) => {
        console.error('Error while updating system names: ', err);
      });
  });
}

function bash(cmdstr) {
  console.log(`\n${chalk.cyan('>>>')} ${chalk.green(cmdstr)}`);
  return execa
    .command(cmdstr, {
      stdio: 'inherit' //, cwd: relPath
    })
    .then(() => {
      console.log('Success!');
    })
    .catch((err) => {
      console.log('\nError! ', err.shortMessage);
      process.exit(err.exitCode);
    });
}

function renameFile(oldName, newName) {
  return new Promise((resolve, reject) => {
    // Rename the file
    fs.rename(oldName, newName, (error) => {
      if (error) {
        reject(new Error(`Failed to rename '${oldName}' to ${newName}.`));
      } else {
        resolve(newName);
      }
    });
  });
}
