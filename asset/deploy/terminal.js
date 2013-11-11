var Terminal = function(containerId) {
    window.URL = window.URL || window.webkitURL;

    const VERSION = '1.0.0';
    const CMDS = [
        'token', 'exit', 'theme', 'version', 'help', 'date', 'clear',
        'cat', 'cd', 'cp', 'ls', 'mkdir', 'mv', 'pwd', 'rm', 'rmdir', 'svn', 'bash'
    ];
    const THEMES = ['default', 'cream'];

    var history = [];
    var histpos = 0;
    var histtemp = 0;

    // Create terminal and cache DOM nodes;
    var container = document.getElementById(containerId);
    var outputContainer;
    var cmdLine;
    var interlace;
    var cwd;

    function updateCWD(){
        cwd.innerHTML = [process.cwd(), '&gt;'].join('');
    }

    function initDOM(){

        container.insertAdjacentHTML('beforeEnd',
            ['<output></output>',
                '<div id="input-line" class="input-line">',
                '<div class="prompt">', process.cwd(), '&gt;</div><div><input class="cmdline" autofocus /></div>',
                '</div>'].join(''));

        cwd = container.querySelector('#input-line .prompt');
        outputContainer = container.querySelector('output');
        cmdLine = container.querySelector('#input-line .cmdline');
        interlace = document.querySelector('.interlace');


        // Hackery to resize the interlace background image as the container grows.
        outputContainer.addEventListener('DOMSubtreeModified', function(e) {
            var docHeight = util.getDocHeight();
            document.documentElement.style.height = docHeight + 'px';
            //document.body.style.background = '-webkit-radial-gradient(center ' + (Math.round(docHeight / 2)) + 'px, contain, rgba(0,75,0,0.8), black) center center no-repeat, black';
            interlace.style.height = docHeight + 'px';
            setTimeout(function() { // Need this wrapped in a setTimeout. Chrome is jupming to top :(
                //window.scrollTo(0, docHeight);
                cmdLine.scrollIntoView();
            }, 0);
            //window.scrollTo(0, docHeight);
        }, false);

        outputContainer.addEventListener('click', function(e) {
            var el = e.target;
            if (el.classList.contains('file') || el.classList.contains('folder')) {
                cmdLine.value += ' ' + el.textContent;
            }
        }, false);

        window.addEventListener('click', function(e) {
            //if (!document.body.classList.contains('offscreen')) {
            cmdLine.focus();
            //}
        }, false);

        // Always force text cursor to end of input line.
        cmdLine.addEventListener('click', inputTextClick, false);

        // Handle up/down key presses for shell history and enter for new command.
        cmdLine.addEventListener('keydown', keyboardShortcutHandler, false);
        cmdLine.addEventListener('keyup', historyHandler, false); // keyup needed for input blinker to appear at end of input.
        cmdLine.addEventListener('keydown', processNewCommand, false);
    }



    /*window.addEventListener('beforeunload', function(e) {
     return "Don't leave me!";
     }, false);*/

    function inputTextClick(e) {
        this.value = this.value;
    }

    function keyboardShortcutHandler(e) {
        // Toggle CRT screen flicker.
        if ((e.ctrlKey || e.metaKey) && e.keyCode == 83) { // crtl+s
            container.classList.toggle('flicker');
            output('<div>Screen flicker: ' +
                (container.classList.contains('flicker') ? 'on' : 'off') +
                '</div>');
            e.preventDefault();
            e.stopPropagation();
        }
    }

    function selectFile(el) {
        alert(el)
    }

    function historyHandler(e) { // Tab needs to be keydown.

        if (history.length) {
            if (e.keyCode == 38 || e.keyCode == 40) {
                if (history[histpos]) {
                    history[histpos] = this.value;
                } else {
                    histtemp = this.value;
                }
            }

            if (e.keyCode == 38) { // up
                histpos--;
                if (histpos < 0) {
                    histpos = 0;
                }
            } else if (e.keyCode == 40) { // down
                histpos++;
                if (histpos > history.length) {
                    histpos = history.length;
                }
            }

            if (e.keyCode == 38 || e.keyCode == 40) {
                this.value = history[histpos] ? history[histpos] : histtemp;
                this.value = this.value; // Sets cursor to end of input.
            }
        }
    }

    function processNewCommand(e) {

        // Beep on backspace and no value on command line.
        if (!this.value && e.keyCode == 8) {
            return;
        }

        if (e.keyCode == 9) { // Tab
            e.preventDefault();
            // TODO(ericbidelman): Implement tab suggest.
        } else if (e.keyCode == 13) { // enter

            // Save shell history.
            if (this.value) {
                history[history.length] = this.value;
                histpos = history.length;
            }

            // Duplicate current input and append to output section.
            var line = this.parentNode.parentNode.cloneNode(true);
            line.removeAttribute('id');
            line.classList.add('line');
            var input = line.querySelector('input.cmdline');
            input.autofocus = false;
            input.readOnly = true;
            outputContainer.appendChild(line);

            // Parse out command, args, and trim off whitespace.
            // TODO(ericbidelman): Support multiple comma separated commands.
            if (this.value && this.value.trim()) {
                var args = this.value.split(' ').filter(function(val, i) {
                    return val;
                });
                var cmd = args[0].toLowerCase();
                args = args.splice(1); // Remove cmd from arg list.
            }

            switch (cmd) {
                case 'token':
                    // global set
                    var token = args[0];
                    localStorage.token = token;
                    if (!token) {
                        output(['Usage: ', cmd, ' value'].join(''));
                        break;
                    }
                    output('Success set token!');
                    break;
                case 'cat':
                    var fileName = args.join(' ');

                    if (!fileName) {
                        output('Usage: ' + cmd + ' filename');
                        break;
                    }

                    exec(this.value, function(result) {
                        output('<pre>' + result + '</pre>');
                    });

                    break;
                case 'clear':
                    clear(this);
                    return;
                case 'date':
                    output((new Date()).toLocaleString());
                    break;
                case 'exit':
                    localStorage.token = '';
                    break;
                case 'help':
                    output('<p>Set token if deploy server must require: <span class="folder">token i-am-token</span></p>');
                    output('<p>Execution your command: <span class="folder">svn checkout URL[@REV] --username ARG --password ARG</span></p>');
                    output('<p>Clear your token: <span class="folder">exit</span></p>');
                    output('<p>Commands: <span class="folder">' + CMDS.join('   ') + '</span></p>');
                    output('<p>More help: <span class="folder">yuanyan &lt;yuanyan@tencent.com&gt;</span></p>');
                    break;
                case 'cd':
                    // TODO
                    var dest = args.join(' ') || '/';
                    // global set
                    process._cwd = path.resolve(path.relative(process.cwd(), dest));
                    exec('pwd', function(result) {
                        output(result);
                        process._cwd = result;
                        updateCWD();
                    });

                    break;
                case 'mkdir':
                    var dashP = false;
                    var index = args.indexOf('-p');
                    if (index != -1) {
                        args.splice(index, 1);
                        dashP = true;
                    }

                    if (!args.length) {
                        output('Usage: ' + cmd + ' [-p] directory<br>');
                        break;
                    }

                    exec(this.value, function(result) {
                        output(result);
                    });

                    break;
                case 'cp':
                case 'mv':
                    var src = args[0];
                    var dest = args[1];

                    if (!src || !dest) {
                        output(['Usage: ', cmd, ' source target<br>',
                            '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', cmd,
                            ' source directory/'].join(''));
                        break;
                    }

                    exec(this.value, function(result) {
                        output(result);
                    });

                    break;
                case 'theme':
                    var theme = args.join(' ');
                    if (!theme) {
                        output(['Usage: ', cmd, ' ' + THEMES.join(',')].join(''));
                    } else {
                        if (THEMES.indexOf(theme) != -1) {
                            setTheme(theme);
                        } else {
                            output('Error - Unrecognized theme used');
                        }
                    }
                    break;
                case 'version':
                case 'ver':
                    output(VERSION);
                    break;
                default:
                    exec(this.value, function(result) {
                        // strip color codes
                        output('<pre>' + result.replace(/\[\d+m/g,'') + '</pre>');
                    });
            }

            this.value = ''; // Clear/setup line for next input.
        }
    }

    function formatColumns(entries) {
        var maxName = entries[0].name;
        util.toArray(entries).forEach(function(entry, i) {
            if (entry.name.length > maxName.length) {
                maxName = entry.name;
            }
        });

        // If we have 3 or less entries, shorten the output container's height.
        // 15px height with a monospace font-size of ~12px;
        var height = entries.length == 1 ? 'height: ' + (entries.length * 30) + 'px;' :
            entries.length <= 3 ? 'height: ' + (entries.length * 18) + 'px;' : '';

        // ~12px monospace font yields ~8px screen width.
        var colWidth = maxName.length * 16; //8

        return ['<div class="ls-files" style="-webkit-column-width:',
            colWidth, 'px;', height, '">'];
    }


    function clear(input) {
        outputContainer.innerHTML = '';
        input.value = '';
        document.documentElement.style.height = '100%';
        interlace.style.height = '100%';
    }

    function setTheme(theme) {
        var currentUrl = document.location.pathname;

        if (!theme || theme == 'default') {
            //history.replaceState({}, '', currentUrl);
            localStorage.removeItem('theme');
            document.body.className = '';
            return;
        }

        if (theme) {
            document.body.classList.add(theme);
            localStorage.theme = theme;
            //history.replaceState({}, '', currentUrl + '#theme=' + theme);
        }
    }

    function output(html) {
        outputContainer.insertAdjacentHTML('beforeEnd', html);
        //output.scrollIntoView();
        cmdLine.scrollIntoView();
    }

    function ajax(url, cb){
        var xhr = new XMLHttpRequest();
        xhr.onload = function(e) {
            if (this.status == 200 && this.readyState == 4) {
                cb(this.response);
            } else {
                output('ERROR: ' + this.status + ' ' + this.statusText);
            }
        };
        xhr.onerror = function(e) {
            output('ERROR: ' + this.status + ' ' + this.statusText);
        };
        xhr.open('GET', url, true);
        xhr.send(null);
    }

    function exec(cmd, cb){
        var baseUrl = './exec?';
        var params = ['token='+ (localStorage.token || ''), 'command='+cmd, 'cwd='+ process.cwd()].join('&');
        var url = baseUrl + params;
        ajax(url, cb);
    }

    function init(){
        var baseUrl = './exec?';
        var params = ['init=true'].join('&');
        var url = baseUrl + params;
        ajax(url, function(cwd){
            process._cwd = cwd;
            initDOM();
            output('<div>Welcome to ' + document.title +
                '! (v' + VERSION + ')</div>');

            output('<p>Documentation: type "help"</p>');
        });
    }

    return {
        init: function() {
            init();
        },
        output: output,
        setTheme: setTheme,
        addDroppedFiles: function(files) {
            util.toArray(files).forEach(function(file, i) {
                // TODO
                // file upload to current dir
            });
        },
        selectFile: selectFile
    }
};




function toggleHelp() {
    document.querySelector('.help').classList.toggle('hidden');
    document.body.classList.toggle('dim');
}

(function() {
    var term = new Terminal('container');
    term.init();

    if (document.location.hash) {
        var theme = document.location.hash.substring(1).split('=')[1];
        term.setTheme(theme);
    } else if (localStorage.theme) {
        term.setTheme(localStorage.theme);
    }

    document.body.addEventListener('keydown', function(e) {
        if (e.keyCode == 27) { // Esc
            toggleHelp();
            e.stopPropagation();
            e.preventDefault();
        }
    }, false);

    // Setup the DnD listeners for file drop.
    document.body.addEventListener('dragenter', function(e) {
        e.stopPropagation();
        e.preventDefault();
        this.classList.add('dropping');
    }, false);

    document.body.addEventListener('dragover', function(e) {
        e.stopPropagation();
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    }, false);

    document.body.addEventListener('dragleave', function(e) {
        this.classList.remove('dropping');
    }, false);

    document.body.addEventListener('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();
        this.classList.remove('dropping');
        term.addDroppedFiles(e.dataTransfer.files);
        // term.output('<div>File(s) added!</div>');
    }, false);
})();