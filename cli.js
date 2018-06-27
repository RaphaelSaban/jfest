#!/usr/bin/env node

const dir = process.cwd(), // System under test
      path = process.argv[1].split('/').slice(0,-1).join('/'),
      
      validateFile = require(path + '/validate_file'),

      fs = require('fs'),
      log = require('./log'),

      lockedFiles = {};

require('./validate/calls').warmup();

validateDir(dir);


function validateDir (dir) {
    log.out("-- watching", dir);
    // Watch changes in this directory
    fs.watch(
        dir,
        {encoding: 'buffer'},
        validateFilesOf(dir)
    );
    // fs.watch does not support 'recursive:true' option on Linux
    // --> manually watch all subdirectories
    fs.readdir(dir, (err, list) => {
        if (err) return;
        list.forEach( (name) => {
            if (isDirIgnored(name))
                return;
            name = dir + '/' + name;
            fs.stat(name, (err, stat) => {
                if (stat && stat.isDirectory())
                    validateDir(name);
            });
        });
    });
};

function validateFilesOf (dir) {
    return (eventType, filename) => {

        // Do not track rename/deletion
        if (eventType === 'rename')
            return;

        if (isFileIgnored(filename))
            return;

        // Event always triggered 2x (change+rename, even if logged as 2x change), process it 1x
        if (filename in lockedFiles)
            return;
        lockedFiles[filename] = true;

        //process.stdout.write(clc.reset);
        log.hLine();
        log.fileChange(filename+' '+eventType);
        
        setTimeout(
            () => validateFile(
                dir+'/'+filename,
                () => delete lockedFiles[filename]
            ),
            50 // Give some time for fs to perform file 'rename', or it will open inexistant file
        );
    }
};

function isFileIgnored (filename) {
    // Do not track temp files (e.g. emacs buffers)
    if (/[~#]/.exec(filename))
        return true;

    // Track javascript files only
    if (! (/.*.js$/.exec(filename)) )
        return true;

    return false;
};

function isDirIgnored (dirname) {
    // Do not track hidden directories, like .git/
    if (/^\./.exec(dirname))
        return true;

    return false;
};
