#! /usr/bin/env node

/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */

const fs = require('fs');
const shell = require('shelljs');
const path = require('path');
const program = require('commander');

let paraview = process.env.PARAVIEW_HOME;

require('shelljs/global');

function quotePath(str) {
  return '"' + str + '"';
}

program
  .version('1.0.0')
  .option('-p, --port [8080]', 'Start web server with given port', 8080)
  .option('-d, --data [directory]', 'Data directory to serve')
  .option('-s, --server-only', 'Do not open the web browser\n')

  .option('--paraview [path]', 'Provide the ParaView root path to use')

  .option('--data-analysis', 'Inspect data directory and compute metadata\n')

  .option('--config [path]', 'Provide a Lightviz config file to use')
  .option(
    '--profile [profile]',
    'Specify which profile from the config file to use\n'
  )

  .option(
    '--add-dataset [path]',
    'Specify a dataset to add to the given data directory.  Requires the description and data flags'
  )
  .option(
    '--description [description]',
    'Specify the description for the dataset being added'
  )
  .option(
    '--autoApply',
    'Optional for use with --add-dataset.  Specifies that apply/reset buttons are not needed with the dataset'
  )
  .option('--virtual-env [path]', 'Path to virtual environment to use')
  .option('--settings-lod-threshold [102400]', 'LOD Threshold in Megabytes\n')

  .parse(process.argv);

// Try to find a paraview directory inside /Applications or /opt
const pvPossibleBasePath = [];
['/Applications', '/opt', '/usr/local/opt/'].forEach(function(directoryPath) {
  shell.ls(directoryPath).forEach(function(fileName) {
    if (fileName.toLowerCase().indexOf('paraview') !== -1) {
      pvPossibleBasePath.push(path.join(directoryPath, fileName));
    }
  });
});

if (!paraview) {
  paraview = [];
  [program.paraview].concat(pvPossibleBasePath).forEach(function(directory) {
    try {
      if (fs.statSync(directory).isDirectory()) {
        paraview.push(directory);
      }
    } catch (err) {
      // skip
    }
  });
}

if (!process.argv.slice(2).length || !program.help || paraview.length === 0) {
  program.outputHelp();
  process.exit(0);
}

var pvPythonExecs = shell.find(paraview).filter(function(file) {
  return file.match(/pvpython$/) || file.match(/pvpython.exe$/);
});
if (pvPythonExecs.length < 1) {
  console.log(
    'Could not find pvpython in your ParaView HOME directory ($PARAVIEW_HOME)'
  );
  program.outputHelp();
} else {
  if (program.addDataset) {
    if (!program.data) {
      console.log(
        'Adding data requires specifying the data directory to use with -d or --data'
      );
      process.exit(1);
    }
    if (!program.description) {
      console.log(
        'Adding data requires specifying the description of the dataset with --description'
      );
    }
    const addDatasetCmdLine = [
      quotePath(pvPythonExecs[0]),
      '-dr',
      quotePath(
        path.normalize(path.join(__dirname, '../server/add_dataset.py'))
      ),
      '--data-dir',
      quotePath(program.data),
      '--file',
      quotePath(program.addDataset),
      '--description',
      quotePath(program.description),
    ];
    if (program.autoApply) {
      addDatasetCmdLine.push('--autoApply');
    }
    if (program.virtualEnv) {
      cmdLine.push('--virtual-env');
      cmdLine.push(program.virtualEnv);
    }

    console.log(
      '\n==============================================================================='
    );
    console.log('| Execute:');
    console.log('| $', addDatasetCmdLine.join('\n|\t'));
    console.log(
      '===============================================================================\n'
    );
    shell
      .exec(addDatasetCmdLine.join(' '), { async: true })
      .stdout.on('data', function(data) {
        if (data.indexOf('Starting factory') !== -1) {
          // Open browser if asked
          if (!program.serverOnly) {
            require('open')('http://localhost:' + program.port);
          }
        }
      });
  } else {
    const cmdLine = [
      quotePath(pvPythonExecs[0]),
      '-dr',
      '--force-offscreen-rendering',
      quotePath(
        path.normalize(path.join(__dirname, '../server/pvw-light-viz.py'))
      ),
      '--content',
      quotePath(path.normalize(path.join(__dirname, '../dist'))),
      '--port',
      program.port,
    ];
    if (program.data) {
      cmdLine.push('--data');
      cmdLine.push(quotePath(program.data));
      // cmdLine.push('--fs-endpoints');
      // cmdLine.push('ds:' + program.data);
    }
    if (program.config) {
      cmdLine.push('--config');
      cmdLine.push(quotePath(program.config));
    }
    if (program.profile) {
      cmdLine.push('--profile');
      cmdLine.push(quotePath(program.profile));
    }
    if (program.virtualEnv) {
      cmdLine.push('--virtual-env');
      cmdLine.push(program.virtualEnv);
    }

    if (program.settingsLodThreshold) {
      cmdLine.push('--settings-lod-threshold');
      cmdLine.push(program.settingsLodThreshold);
    }

    console.log(
      '\n==============================================================================='
    );
    console.log('| Execute:');
    console.log('| $', cmdLine.join('\n|\t'));
    console.log(
      '===============================================================================\n'
    );
    shell
      .exec(cmdLine.join(' '), { async: true })
      .stdout.on('data', function(data) {
        if (data.indexOf('Starting factory') !== -1) {
          // Open browser if asked
          if (!program.serverOnly) {
            require('open')('http://localhost:' + program.port);
          }
        }
      });
  }
}
