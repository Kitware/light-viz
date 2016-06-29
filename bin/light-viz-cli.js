#! /usr/bin/env node

var fs = require('fs'),
    path = require('path'),
    program = require('commander'),
    paraview = process.env.PARAVIEW_HOME;

require('shelljs/global');

program
  .version('1.0.0')
  .option('-p, --port [8080]', 'Start web server with given port', 8080)
  .option('-d, --data [directory]', 'Data directory to serve')
  .option('-s, --server-only', 'Do not open the web browser\n')

  .option('--paraview [path]', 'Provide the ParaView root path to use')
  .option('--offscreen', 'Use flag to specify that ParaView should be used in Offscreen mode\n')

  .option('--data-analysis', 'Inspect data directory and compute metadata\n')

  .option('--config [path]', 'Provide a Lightviz config file to use')
  .option('--profile [profile]', 'Specify which profile from the config file to use\n')

  .option('--add-dataset [path]', 'Specify a dataset to add to the given data directory.  Requires the description and data flags')
  .option('--description [description]', 'Specify the description for the dataset being added')
  .option('--autoApply', 'Optional for use with --add-dataset.  Specifies that apply/reset buttons are not needed with the dataset')

  .parse(process.argv);

if(!paraview) {
    paraview = [];
    [ program.paraview, '/Applications/paraview.app/Contents', '/opt/paraview'].forEach(function(directory){
        try {
            if(fs.statSync(directory).isDirectory()) {
                paraview.push(directory);
            }
        } catch(err) {
            // skip
        }
    });
}

if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit(0);
}


var pvPythonExecs = find(paraview).filter(function(file) { return file.match(/pvpython$/) || file.match(/pvpython.exe$/); });
if(pvPythonExecs.length < 1) {
    console.log('Could not find pvpython in your ParaView HOME directory ($PARAVIEW_HOME)');
    program.outputHelp();
} else {
    if (program.addDataset) {
        if (!program.data) {
            console.log('Adding data requires specifying the data directory to use with -d or --data');
            process.exit(1);
        }
        if (!program.description) {
            console.log('Adding data requires specifying the description of the dataset with --description');
        }
        const addDatasetCmdLine = [ pvPythonExecs[0], '-dr',
            path.normalize(path.join(__dirname, '../server/add_dataset.py')),
            '--data-dir', program.data, '--file', program.addDataset, '--description',
            program.description
        ];
        if (program.autoApply) {
          addDatasetCmdLine.push('--autoApply');
        }

        console.log('\n===============================================================================');
        console.log('| Execute:');
        console.log('| $', addDatasetCmdLine.join('\n|\t'));
        console.log('===============================================================================\n');
        exec(addDatasetCmdLine.join(' '), {async:true}).stdout.on('data', function(data) {
            if(data.indexOf('Starting factory') !== -1) {
                // Open browser if asked
                if (!program.serverOnly) {
                    require('open')('http://localhost:' + program.port);
                }
            }
        });
    } else {
        const cmdLine = [
            pvPythonExecs[0], '-dr',
            path.normalize(path.join(__dirname, '../server/pvw-light-viz.py')),
            '--content', path.normalize(path.join(__dirname, '../dist')),
            '--port', program.port,
        ];
        if (program.data) {
          cmdLine.push('--data');
          cmdLine.push(program.data);
        }
        if (program.config) {
          cmdLine.push('--config');
          cmdLine.push(program.config);
        }
        if (program.profile) {
          cmdLine.push('--profile');
          cmdLine.push(program.profile);
        }
        if (program.offscreen) {
          cmdLine.push('--offscreen');
        }

        console.log('\n===============================================================================');
        console.log('| Execute:');
        console.log('| $', cmdLine.join('\n|\t'));
        console.log('===============================================================================\n');
        exec(cmdLine.join(' '), {async:true}).stdout.on('data', function(data) {
            if(data.indexOf('Starting factory') !== -1) {
                // Open browser if asked
                if (!program.serverOnly) {
                    require('open')('http://localhost:' + program.port);
                }
            }
        });
    }
}


